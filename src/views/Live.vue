<template>
  <v-ons-page>

    <!-- Create Simple Table That Organizes Live Rankings Of Users Based On Point Spread -->
    <v-ons-list>
      <v-ons-list-header>Live Tracker</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>Game Rank</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="item in liveRankingResults" :key="item.avgRank">
              <td>{{item.player}}</td>
              <td>{{item.avgRank}}</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    
  </v-ons-page>
</template>

<script>
import db from '@/db';

export default {
  name: "Live",
  data () {
    return {
      currentSeason: '',
      currentWeek: 0,
      currentGameObject: {},
      firebaseUserData: [], 
      liveRankingResults: [],
      user: {
        displayName: this.$store.state.sessionUser.user
      }
    }
  },
  methods: 
  {
    calculateLiveRankings (userGuess) {
      
      let psuScore = userGuess.PsuScore
      let opponentScore =  userGuess.OpponentScore

      const selectedWinner = userGuess.Winner;
      const selectionTotal = ( psuScore + opponentScore );
      const selectionSpread = ( psuScore - opponentScore );
      
      let livePsuScore;
      let liveOpponentScore;
      let liveWinner;

      if (this.currentGameObject.HomeTeam === "PENNST") {
        livePsuScore = this.currentGameObject.HomeTeamScore
        liveOpponentScore = this.currentGameObject.AwayTeamScore
        liveWinner = livePsuScore > liveOpponentScore ? this.currentGameObject.HomeTeam : this.currentGameObject.AwayTeam;
      } else if (this.currentGameObject.HomeTeam !== "PENNST") {
        liveOpponentScore = this.currentGameObject.HomeTeamScore
        livePsuScore = this.currentGameObject.AwayTeamScore
        liveWinner = liveOpponentScore > livePsuScore ? this.currentGameObject.HomeTeam : this.currentGameObject.AwayTeam;
      }

      let liveTotal = ( livePsuScore + liveOpponentScore );
      let liveSpread = ( livePsuScore - liveOpponentScore );

      let psuDelta = Math.abs(livePsuScore - psuScore);
      let opponentDelta = Math.abs(liveOpponentScore - opponentScore);
      let totalDelta = Math.abs(psuDelta - opponentDelta);
      let spreadDelta = ( psuDelta + opponentDelta);
      let guessedCorrectWinner = liveWinner === userGuess.Winner ? true : false

      this.liveRankingResults.push({
        player: userGuess.Player,
        selectedWinner: userGuess.Winner,
        selectedPsuScore: psuScore,
        selectedOpponentScore: opponentScore,
        selectionTotal: selectionTotal,
        selectionSpread: selectionSpread,
        liveWinner: liveWinner,
        livePsuScore: livePsuScore,
        liveOpponentScore: liveOpponentScore,
        liveTotal: liveTotal,
        liveSpread:liveSpread,
        psuScoreDelta: psuDelta,
        opponentDelta: opponentDelta,
        totalDelta: totalDelta,
        spreadDelta: spreadDelta,
        guessedCorrectWinner: guessedCorrectWinner,
        psuRank: null,
        opponentRank: null,
        totalRank: null,
        spreadRank: null,
        avgRank: null,
        gameRank: null,
        points: null
      })

    },
    calculateScores () {
      let parsedObj = JSON.parse(JSON.stringify(this.firebaseUserData))
      
      //this.getLatestScores()
      //console.log(this.test)
      const URL = 'https://api.sportsdata.io';
      const APIKey = 'aece277790af4bbdaec038cb6d0ad4d5';
      let gameObj = {};

      //fetch(`${URL}/v3/cfb/scores/json/GamesByWeek/${this.currentSeason}/${this.currentWeek}?key=${APIKey}`)
      fetch(`${URL}/v3/cfb/scores/json/GamesByWeek/${2018}/${1}?key=${APIKey}`)
      .then((response) => {
        return response.json();
      }).then((myJson) => {
        for (let game of myJson) {
          if(game.HomeTeam === "PENNST" || game.AwayTeam === "PENNST" ) {
            this.currentGameObject = game;
            break;
          }
        }
      }).then(() => {
        
        parsedObj.forEach((element) => {
          
          this.calculateLiveRankings(element)

        })
        
        let n = this.liveRankingResults.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.liveRankingResults[j].psuScoreDelta > this.liveRankingResults[j + 1].psuScoreDelta) 
            { 
              let temp = this.liveRankingResults[j]; 
              this.liveRankingResults[j] = this.liveRankingResults[j + 1]; 
              this.liveRankingResults[j + 1] = temp; 
            } 
          }
        }
        
        let counter = 1;
        this.liveRankingResults.forEach((element) => {
          element.psuRank = counter;
          counter++;
        })

        n = this.liveRankingResults.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.liveRankingResults[j].opponentDelta > this.liveRankingResults[j + 1].opponentDelta) 
            { 
              let temp = this.liveRankingResults[j]; 
              this.liveRankingResults[j] = this.liveRankingResults[j + 1]; 
              this.liveRankingResults[j + 1] = temp; 
            } 
          }
        }

        counter = 1;
        this.liveRankingResults.forEach((element) => {
          element.opponentRank = counter;
          counter++;
        })

        n = this.liveRankingResults.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.liveRankingResults[j].totalDelta > this.liveRankingResults[j + 1].totalDelta) 
            { 
              let temp = this.liveRankingResults[j]; 
              this.liveRankingResults[j] = this.liveRankingResults[j + 1]; 
              this.liveRankingResults[j + 1] = temp; 
            } 
          }
        }

        counter = 1;
        this.liveRankingResults.forEach((element) => {
          element.totalRank = counter;
          counter++;
        })
        
        n = this.liveRankingResults.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.liveRankingResults[j].spreadDelta > this.liveRankingResults[j + 1].spreadDelta) 
            { 
              let temp = this.liveRankingResults[j]; 
              this.liveRankingResults[j] = this.liveRankingResults[j + 1]; 
              this.liveRankingResults[j + 1] = temp; 
            } 
          }
        }

        counter = 1;
        this.liveRankingResults.forEach((element) => {
          element.spreadRank = counter;
          counter++;
        })

        this.liveRankingResults.forEach((element) => {
          let average = ( ( element.psuRank + element.opponentRank + element.totalRank + element.spreadRank ) / 4);
          element.avgRank = average;
        })

        n = this.liveRankingResults.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.liveRankingResults[j].avgRank > this.liveRankingResults[j + 1].avgRank) 
            { 
              let temp = this.liveRankingResults[j]; 
              this.liveRankingResults[j] = this.liveRankingResults[j + 1]; 
              this.liveRankingResults[j + 1] = temp; 
            } 
          }
        }
        // Give winning player a point
        if (true) {
          // perfect score add 2
        } else {
          // else add only 1 poin
        } 
        this.liveRankingResults[0].points = 1.00;
        for(let i =1; i < this.liveRankingResults.length;i++) {
          this.liveRankingResults[i].points = 0.00;
        }

      })
    },
    getPlayerData() {
      // Get All Documents in Current Season Year From Firebase
      db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          // If Players Datas week == current week add to playersdata array
          if(doc.data().Week === this.currentWeek) {
            this.firebaseUserData.push(doc.data())
          }
        })
      }).then(() => {
        // Calculate Point Spreads For Players
        this.calculateScores();
      }).then(()=> {
        if (this.currentGameObject.Status === "Final" || this.currentGameObject.Status === "F/OT" ) {
          db.collection(`${this.currentSeason}_Season_Rankings`).get().then(querySnapshot =>{
            querySnapshot.forEach((doc)=>{
              if(!querySnapshot.empty)
              {
                const user = this.liveRankingResults.find(x => x.player === doc.data().Player)
                console.log(user)
                db.collection(`${this.currentYear}_Season_Rankings`).doc(`Player_${this.user.displayName}`).set({
                  CurrentWeek: this.currentWeek, // Use This to Calc Average In Rankings
                  Season: this.currentSeason,
                  Player: user.player,
                  Average: doc.data().Average += user.avgRank,
                  Points: doc.data().Points += user.points
                })
              }
            })
          })
        }
      })
    },
   
  },
  created () 
  {

    // Get Current Season
    this.currentSeason = this.$store.state.currentYear.currentYear;

    // Get Current Week of Year Ex Week {1}
    this.currentWeek = this.$store.state.currentWeekNumber.weekNumber;
    
    // Get Current Game Object
    this.currentGameObject = this.$store.state.currentGameObject.gameObject;

    // Get Firebase player Data this.firebaseUserData
    this.getPlayerData();

  }
}

</script>
