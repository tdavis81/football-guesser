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
      resultsArray: [],
      user: {
        displayName: this.$store.state.sessionUser.user
      },
      userGuessObject: {
        player: '',
        psuScore: 0,
        opponentScore: 0,
        winningTeam: '',
        totalPoints: 0,
        spread: 0
      },
      liveScoringObject: {
        psuScore: 0,
        opponentScore: 0,
        winningTeam: "",
        totalPoints: 0,
        spread: 0,

      },
      liveDelta: {
        psu: 0,
        opponent: 0,
        total: 0,
        spread: 0,
      }
    }
  },
  computed: 
  {
    organizeRankings () {
      return liveRankingRankgs //Check who is first 
    }
  },
  methods: 
  {
    getUserGuessSpreads (userFirebaseGameRecord) {
      
      // GET The Current Player In The Iderations
      this.userGuessObject.player = userFirebaseGameRecord.Player;
      // GET User PSU Score From Firebase
      this.userGuessObject.psuScore = userFirebaseGameRecord.PsuScore;
      // GET User Opponenet Score From Firebase
      this.userGuessObject.opponentScore = userFirebaseGameRecord.OpponentScore;
      // GET User Selected Winner From Firebase
      this.userGuessObject.winningTeam = userFirebaseGameRecord.userGuessWinner

      // ADD User PSU Score With User Opponent Score To Get Total
      this.userGuessObject.totalPoints = ( userFirebaseGameRecord.PsuScore + userFirebaseGameRecord.OpponentScore );
      // Subtract User PSU Score By User Opponent Score To Get Spread
      this.userGuessObject.spread = ( userFirebaseGameRecord.PsuScore - userFirebaseGameRecord.OpponentScore );

    },
    getLiveSpreads () {
      
      // Check If PSU Is Home Team
      let isPsuHomeTeam = this.currentGameObject.HomeTeam === 'PENNST' ? true : false;
      
      // If True Set PSU Score To Home Team Score & Opponent Score To Away Score & Calculate Winner 
      if (isPsuHomeTeam) 
      {
        this.liveScoringObject.psuScore = this.currentGameObject.HomeTeamScore
        this.liveScoringObject.opponentScore = this.currentGameObject.AwayTeamScore
        this.liveScoringObject.winningTeam = this.liveScoringObject.psuScore > this.liveScoringObject.opponentScore ? this.currentGameObject.HomeTeam : this.currentGameObject.AwayTeam;
      } 
      else 
      {
        this.liveScoringObject.psuScore = this.currentGameObject.AwayTeamScore
        this.liveScoringObject.opponentScore = this.currentGameObject.HomeTeamScore
        this.liveScoringObject.winningTeam = this.liveScoringObject.psuScore > this.liveScoringObject.opponentScore ? this.currentGameObject.AwayTeam : this.currentGameObject.HomeTeam;
      }

      // ADD Live PSU Score With Live Opponent Score To Get Total
      this.liveScoringObject.totalPoints = ( this.liveScoringObject.psuScore + this.liveScoringObject.opponentScore );
      // Subtract Live PSU Score By Live Opponent Score To Get Spread
      this.liveScoringObject.spread = ( this.liveScoringObject.psuScore - this.liveScoringObject.opponentScore );

    },
    calculateDeltas () {
      
      // GET PSU Delta Live Scoring PSU Score Minue User Guess PSU Score
      this.liveDelta.psu = Math.abs( this.liveScoringObject.psuScore - this.userGuessObject.psuScore );
      // GET Opponent Delta Live Scoring Opponent Score Minue User Guess Opponent Score
      this.liveDelta.opponent = Math.abs( this.liveScoringObject.opponentScore - this.userGuessObject.opponentScore );
      // GET Total Live PSU Minus Live Opponent Score
      this.liveDelta.total = Math.abs( this.liveDelta.psu - this.liveDelta.opponent );
      // GET Spread Live PSU Score Plus Live Opponent Score
      this.liveDelta.spread = ( this.liveDelta.psu + this.liveDelta.opponent );

    },
    addToResultsArray () {
      
      /*
      {
        Player: "Tyler",
        deltas: {
          psu: 5,
          opponent: 10,
          total: 15,
          spread:5
        }
      }
      */
      this.resultsArray.push({
        player: this.userGuessObject.player,
        deltas: this.liveDelta,
      })

    },
    startCalculations () {

      this.getLiveSpreads()
      this.firebaseUserData.forEach((el) => {
        this.getUserGuessSpreads(el)
        this.calculateDeltas()
        this.addToResultsArray();
      })
      //this.calculateRankings() // should be computed call
      
    },
    getPlayerData () {
      db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          //console.log(this.currentWeek)
          if(doc.data().Week === this.currentWeek) {
            this.firebaseUserData.push(doc.data())
          }
        })
      }).then(() => {
        this.startCalculations();
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
