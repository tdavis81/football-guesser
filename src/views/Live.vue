<template>
  <v-ons-page :key="componentKey">

    <!-- Create Simple Table That Organizes Live Rankings Of Users Based On Point Spread -->
    <v-ons-list>
      <v-ons-list-header>Live Tracker</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>Game Avg</th>
              <th>Position</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="item in resultsArray" :key="item.avgRank">
              <td>{{item.player}}</td>
              <td>{{item.avgRank}}</td>
              <td>{{item.finalNumRank}}</td>
              <td>{{item.awardedPoints}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    
  </v-ons-page>
</template>

<script>
import db from '@/db';
// Reference to Moment JS 
import moment from 'moment'

export default {
  name: "Live",
  data () {
    return {
      APIKey:'aece277790af4bbdaec038cb6d0ad4d5', // UPDATE TO ACCOUNT APIKEY
      URL:'https://api.sportsdata.io',
      DEBUG: true,
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
      },
      componentKey: 0
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
    getUserGuessSpreads (userFirebaseGameRecord) {
      
      // GET The Current Player In The Iteriation
      let player = userFirebaseGameRecord.Player;
      
      // GET User PSU Score From Firebase
      let psuScore = userFirebaseGameRecord.PsuScore;
      
      // GET User Opponenet Score From Firebase
      let opponentScore = userFirebaseGameRecord.OpponentScore;
      
      // GET User Selected Winner From Firebase
      let selectedWinner = userFirebaseGameRecord.Winner
      
      // ADD User PSU Score With User Opponent Score To Get Total
      let totalPoints = ( psuScore + opponentScore );
      
      // Subtract User PSU Score By User Opponent Score To Get Spread
      let spread = ( psuScore - opponentScore );
      
      // Calculate Deltas From Live Scoring and User Guesses
      this.calculateDeltas(player,psuScore,opponentScore,selectedWinner,totalPoints,spread)

    },
    calculateDeltas (player,psuScore,opponentScore,selectedWinner,totalPoints,spread) {

      // GET PSU Delta Live Scoring PSU Score Minue User Guess PSU Score
      let psuDelta = Math.abs( this.liveScoringObject.psuScore - psuScore );

      // GET Opponent Delta Live Scoring Opponent Score Minue User Guess Opponent Score
      let opponentDelta = Math.abs( this.liveScoringObject.opponentScore - opponentScore );

      // GET Total Live PSU Minus Live Opponent Score
      let totalDelta =  ( psuDelta + opponentDelta );

      // GET Spread Live PSU Score Plus Live Opponent Score
      let spreadDelta = Math.abs( psuDelta - opponentDelta );
      
      // Add To Results Array
      this.addToResultsArray(player,psuDelta,opponentDelta,selectedWinner,totalDelta,spreadDelta,psuScore,opponentScore);
    
    
    },
    addToResultsArray (player,psuDelta,opponentDelta,selectedWinner,totalDelta,spreadDelta,psuScore,opponentScore) {
      
      this.resultsArray.push({
        player: player,
        selectedWinner: selectedWinner,
        playerPsuScore: psuScore,
        playerOpponentScore: opponentScore, 
        psuDelta: psuDelta,
        opponentDelta: opponentDelta,
        totalDelta: totalDelta,
        spreadDelta: spreadDelta,
        psuRank: null,
        opponentRank: null,
        totalDeltaRank: null,
        spreadDeltaRank: null,
        avgRank: null,
        finalNumRank: null,
        awardedPoints: 0
      })
      
    },
    organizeRanks (num) {
      this.resultsArray.sort(function(a, b) {
        let a1;
        let b1;
        switch(num) {
          case 1:
            a1 = a.psuDelta
            b1 = b.psuDelta
          break;
          case 2:
            a1 = a.opponentDelta
            b1 = b.opponentDelta
          break;
          case 3:
            a1 = a.totalDelta
            b1 = b.totalDelta
          break;
          case 4:
            a1 = a.spreadDelta
            b1 = b.spreadDelta
          break;
        }
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });
    },
    assignRanks (num) {
      for(let i=0; i < this.resultsArray.length;i++) {
        switch(num) {
          case 1:
            if (i > 0) {
              if (this.resultsArray[i-1].psuDelta === this.resultsArray[i].psuDelta) {
                this.resultsArray[i].psuRank = this.resultsArray[i-1].psuRank;
              } else {
                this.resultsArray[i].psuRank = i+1
              }
            } else {
              this.resultsArray[i].psuRank = i+1;
            }
          break;
          case 2:
            if (i > 0) {
              if (this.resultsArray[i-1].opponentDelta === this.resultsArray[i].opponentDelta) {
                this.resultsArray[i].opponentRank = this.resultsArray[i-1].opponentRank;
              } else {
                this.resultsArray[i].opponentRank = i+1
              }
            } else {
              this.resultsArray[i].opponentRank = i+1;
            }
          break;
          case 3:
            if (i > 0) {
              if (this.resultsArray[i-1].totalDelta === this.resultsArray[i].totalDelta) {
                this.resultsArray[i].totalDeltaRank = this.resultsArray[i-1].totalDeltaRank;
              } else {
                this.resultsArray[i].totalDeltaRank = i+1
              }
            } else {
              this.resultsArray[i].totalDeltaRank = i+1;
            }
          break;
          case 4:
            if (i > 0) {
              if (this.resultsArray[i-1].spread === this.resultsArray[i].spread) {
                this.resultsArray[i].spreadDeltaRank = this.resultsArray[i-1].spreadDeltaRank;
              } else {
                this.resultsArray[i].spreadDeltaRank = i+1
              }
            } else {
              this.resultsArray[i].spreadDeltaRank = i+1;
            }
          break;
        }
      }
      
    },
    sortRankings () {
      
      for(let i =1; i < 5;i++) {
        this.organizeRanks(i);
        this.assignRanks(i);
      }
      
      // Get Final Average 
      for(let i =0; i < this.resultsArray.length;i++) {
        let isWinnerPoint = 0;
        if(this.resultsArray[i].selectedWinner === this.liveScoringObject.winningTeam) {
          isWinnerPoint = 1;
        }
        let total= (this.resultsArray[i].psuRank + this.resultsArray[i].opponentRank +  this.resultsArray[i].totalDeltaRank +  this.resultsArray[i].spreadDeltaRank + isWinnerPoint );
        this.resultsArray[i].avgRank = ( total / 4 );
      }

      // Get Final Position // FIX this entire shit
      for(let i =0; i < this.resultsArray.length;i++) {
        if (i > 0) 
        {
          if (this.resultsArray[i-1].avgRank === this.resultsArray[i].avgRank) {
            this.resultsArray[i].finalNumRank = this.resultsArray[i-1].finalNumRank;
          } else {
            this.resultsArray[i].finalNumRank = i+1
          }
        } 
        else 
        {
          this.resultsArray[i].finalNumRank = i+1;
        }
      }
      
      // Get Count of Players with Final Rank 1
      let positionOneCount = 0;
      for(let i=0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].finalNumRank === 1) {
          positionOneCount++;
        }
        this.resultsArray[i].awardedPoints = 0.00
      }
      
      for(let i=0; i < positionOneCount;i++) {
        if (positionOneCount === 1) {
          if (this.resultsArray[i].playerPsuScore === this.liveScoringObject.psuScore 
          && this.resultsArray[i].playerOpponentScore === this.liveScoringObject.opponentScore 
          && this.resultsArray[i].selectedWinner === this.liveScoringObject.winningTeam ) {
            this.resultsArray[i].awardedPoints = 2.00;
          } else
            this.resultsArray[i].awardedPoints = 1.00;
        }
        else {
          if (this.resultsArray[i].playerPsuScore === this.liveScoringObject.psuScore 
          && this.resultsArray[i].playerOpponentScore === this.liveScoringObject.opponentScore 
          && this.resultsArray[i].selectedWinner === this.liveScoringObject.winningTeam ) {
            this.resultsArray[i].awardedPoints = 2.00;
          } else
            this.resultsArray[i].awardedPoints = 1.00 / positionOneCount;
        }
      }



    },
    startCalculations () {

      this.getLiveSpreads()
      this.firebaseUserData.forEach((el) => {
        this.getUserGuessSpreads(el)
      })
      this.sortRankings()
      //this.calculateRankings() // should be computed call
    
    },
    getPlayerData () {
      db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          if(doc.data().Week === this.currentWeek) {
            this.firebaseUserData.push(doc.data())
          }
        })
      }).then(() => {
        this.startCalculations();
      })
    },
    // GET Current Week Of Season
    getCurrentWeek () 
    {
      if (this.DEBUG)
      {
        this.currentWeek = 1
        this.getCurrentSeason()
      }
      else 
      {
        fetch(`${this.URL}/v3/cfb/scores/json/CurrentWeek?key=${this.APIKey}`).then((response) => {
          return response.json();
        }).then((myJson) => { 
          // Set Variable to Week Value - Returns EX. 1
          this.currentWeek = myJson
        }).then(() => {
          // After That Event Completes, GET Current Season Value
          this.getCurrentSeason()
        })
      }

    },

    // GET Current Season
    getCurrentSeason() 
    {

      fetch(`${this.URL}/v3/cfb/scores/json/CurrentSeason?key=${this.APIKey}`).then((response) => {
        return response.json();
      }).then((myJson) => { 
        // Set Variable to Season Value - Returns EX. 2019
        this.currentSeason = myJson
      }).then(() => {
        // After That Event Completes, GET Current Game Object
        this.getCurrentGame()
      })

    },
    
    // GET Current Game Object
    getCurrentGame() 
    { 
      //this.currentSeason
      fetch(`${this.URL}/v3/cfb/scores/json/GamesByWeek/${2018}/${this.currentWeek}?key=${this.APIKey}`).then((response) => {
        return response.json();
      }).then((myJson) => {
        // Find PENNST Game Via Returned JSON Array
        let psuGame = myJson.find(x => x.HomeTeam === "PENNST" || x.AwayTeam === "PENNST")
        // Set Variable to PSU Current Game Object
        this.currentGameObject = psuGame
      }).then(() => {
        // Get Firebase player Data this.firebaseUserData
        this.getPlayerData();
      }).then(() => {
        
      })
    }
  },
  created () 
  {
    this.getCurrentWeek()

  }
}

</script>
