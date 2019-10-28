<template>
  <v-ons-page>
    <v-ons-button @click="refreshScores()" modifier="large" class="button-margin" style="background-color:green">
      Refresh Scores
      <v-ons-icon style="color:white" icon="md-refresh" class="list-item__icon"></v-ons-icon>
    </v-ons-button>
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
            <tr v-for="(item,index) in resultsArray" :key="index">
              <td>{{item.player.substring(0,4)}}</td>
              <td>{{item.avgRank}}</td>
              <td>{{item.finalNumRank}}</td>
              <td>{{parseFloat(item.awardedPoints).toFixed(2)}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    <v-ons-list>
      <v-ons-list-header>Live Data</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>PSU</th>
              <th>Opp</th>
              <th>Winning</th>
              <th>Total</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr>
              <td>{{liveScoringObject.psuScore}}</td>
              <td>{{liveScoringObject.opponentScore}}</td>
              <td>{{liveScoringObject.winningTeam}}</td>
              <td>{{liveScoringObject.totalPoints}}</td>
              <td>{{liveScoringObject.spread}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    <v-ons-list>
      <v-ons-list-header>Player Scores</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>PSU Score</th>
              <th>Opponent Score</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="(item,index) in firebaseUserData" :key="index">
              <td>{{item.Player.substring(0,4)}}</td>
              <td>{{item.PsuScore}}</td>
              <td>{{item.OpponentScore}}</td>
              <td>{{item.Winner}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    <v-ons-list>
      <v-ons-list-header>Deltas</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>PSU</th>
              <th>Opp</th>
              <th>Total</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="(item,index) in resultsArray" :key="index">
              <td>{{item.player.substring(0,4)}}</td>
              <td>{{item.psuDelta}}</td>
              <td>{{item.opponentDelta}}</td>
              <td>{{item.totalDelta}}</td>
              <td>{{item.spreadDelta}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>

    <v-ons-list>
      <v-ons-list-header>Rankings</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>PSU</th>
              <th>Opp</th>
              <th>Total</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="(item,index) in resultsArray" :key="index">
              <td>{{item.player.substring(0,4)}}</td>
              <td>{{item.psuRank}}</td>
              <td>{{item.opponentRank}}</td>
              <td>{{item.totalDeltaRank}}</td>
              <td>{{item.spreadDeltaRank}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>
    <download-excel
        class   = "exportStyle"
        :data   = "resultsArray"
        :fields = "json_fields"
        worksheet = "Game"
        name    = "HartranftCup Excel Export.xls">
    
        Click To Export Data To Excel
    </download-excel>
  </v-ons-page>
</template>

<script>
import JsonExcel from 'vue-json-excel'
import db from '@/db';
// Reference to Moment JS 
import moment from 'moment'
import { log } from 'util';

export default {
  name: "Live",
  data () {
    return {
      currentWeek: this.$store.state.currentWeekNumber.Week,
      currentSeason: this.$store.state.currentSeason.Season,
      currentGameObject: this.$store.state.currentGameObject.Game,
      homeTeamScore: 0,
      awayTeamScore: 0,
      firebaseUserData: [], 
      liveRankingResults: [],
      resultsArray: [],
      user:[],
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
      completeFinalList: [],
      json_fields: {
        'Player': 'player',
        'User Winner': 'selectedWinner',
        'User PSU Score': 'playerPsuScore',
        'User Opponent User Score': 'playerOpponentScore',

        'Live Winner': 'liveScoringObject.winningTeam',
        'Live PSU Score': 'liveScoringObject.psuScore',
        'Live Opponent Score': 'liveScoringObject.opponentScore',
        'Live Total Delta': 'liveScoringObject.totalPoints',
        'Live Spread Delta': 'liveScoringObject.spread',
        
        'Calc PSU Score Delta':'psuDelta',
        'Calc Opponent Score Delta':'opponentDelta',
        'Calc Total Delta': 'totalDelta',
        'Calc Spread Delta': 'spreadDelta',

        'Calc PSU Score Rank': 'psuRank',
        'Calc Opponent Score Rank': 'opponentRank',
        'Calc Total Rank': 'totalDeltaRank',
        'Calc Spread Rank': 'spreadDeltaRank',
        'Calc Avg Rank': 'avgRank',
        
        'Calc Winner Only Rank': 'winnerRank',
        'Calc Loser Only Rank': 'loseRank',
        'Calc Bonus Pt': 'bonusPoint',
        'Calc Game Rank': 'finalNumRank',
        'Calc Pts': 'awardedPoints',
        
        
      },
    }
  },
  methods: 
  {
    refreshScores() {
      location.reload(true);
    },
    getLiveSpreads () {
      // Check If PSU Is Home Team
      let isPsuHomeTeam = this.currentGameObject.HomeTeam === 'PENNST' ? true : false;
      // If True Set PSU Score To Home Team Score & Opponent Score To Away Score & Calculate Winner 
      if (isPsuHomeTeam) 
      {
        //this.liveScoringObject.psuScore = this.currentGameObject.HomeTeamScore === null ? 0 : this.currentGameObject.HomeTeamScore;
        this.liveScoringObject.psuScore = this.homeTeamScore;
        //this.liveScoringObject.opponentScore = this.currentGameObject.AwayTeamScore === null ? 0 : this.currentGameObject.AwayTeamScore;
        this.liveScoringObject.opponentScore = this.awayTeamScore;
        this.liveScoringObject.winningTeam = this.liveScoringObject.psuScore >= this.liveScoringObject.opponentScore ? this.currentGameObject.HomeTeam : this.currentGameObject.AwayTeam;
      } 
      else 
      {
        //this.liveScoringObject.psuScore = this.currentGameObject.AwayTeamScore
        //this.liveScoringObject.opponentScore = this.currentGameObject.HomeTeamScore
        this.liveScoringObject.psuScore = this.awayTeamScore;
        this.liveScoringObject.opponentScore = this.homeTeamScore;
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
      let psuDelta = Math.abs( psuScore - this.liveScoringObject.psuScore  );

      // GET Opponent Delta Live Scoring Opponent Score Minue User Guess Opponent Score
      let opponentDelta = Math.abs( opponentScore - this.liveScoringObject.opponentScore );

      // GET Total Live PSU Minus Live Opponent Score
      let totalDelta = Math.abs( totalPoints - this.liveScoringObject.totalPoints );

      // GET Spread Live PSU Score Plus Live Opponent Score
      let spreadDelta = Math.abs( spread  - this.liveScoringObject.spread );
      
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
        avgRankNumber: null,
        winnerRank: null, 
        loseRank: null,
        bonusPoint: 0,
        finalNumRank: null,
        awardedPoints: 0,
        liveScoringObject: this.liveScoringObject,
      })
    },
    organizeRanks (num) {
      this.resultsArray.sort((a, b) => {
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
          case 5:
            a1 = a.avgRank
            b1 = b.avgRank
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
              if (this.resultsArray[i-1].spreadDelta === this.resultsArray[i].spreadDelta) {
                this.resultsArray[i].spreadDeltaRank = this.resultsArray[i-1].spreadDeltaRank;
              } else {
                this.resultsArray[i].spreadDeltaRank = i+1
              }
            } else {
              this.resultsArray[i].spreadDeltaRank = i+1;
            }
          break;
          case 5:
            if (i > 0) 
            {
              if (this.resultsArray[i-1].avgRank === this.resultsArray[i].avgRank) {
                this.resultsArray[i].avgRankNumber = this.resultsArray[i-1].avgRankNumber;
              } else {
                this.resultsArray[i].avgRankNumber = i+1
              }
            } 
            else 
            {
              this.resultsArray[i].avgRankNumber = i+1;
            }
          break;
        }
      }
    },
    getWinnerLoseRank () {
      let tempWinnerObject = [];
      let tempLoserObject = [];
      let winnerCount = 0;
      
      for(let i =0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].selectedWinner === this.liveScoringObject.winningTeam) {
          tempWinnerObject.push(this.resultsArray[i])
        } else {
          tempLoserObject.push(this.resultsArray[i])
        }
      }

      // Sort all winners by avg rank
      tempWinnerObject.sort((a, b) => {
        let a1 = a.avgRank;
        let b1 = b.avgRank;
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      // Assing Final Ranks
      for(let i=0; i < tempWinnerObject.length;i++) {
        winnerCount++;
        if (i > 0) 
        {
          if (tempWinnerObject[i-1].avgRank === tempWinnerObject[i].avgRank) {
            tempWinnerObject[i].winnerRank = tempWinnerObject[i-1].winnerRank;
          } else {
            tempWinnerObject[i].winnerRank = i+1
          }
        } 
        else 
        {
          tempWinnerObject[i].winnerRank = i+1;
        }
      }

      // Sort all loser by avg rank
      tempLoserObject.sort((a, b) => {
        let a1 = a.avgRank;
        let b1 = b.avgRank;
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      // Assing Final Ranks
      for(let i=0; i < tempLoserObject.length;i++) {
        if (i > 0) 
        {
          if (tempLoserObject[i-1].avgRank === tempLoserObject[i].avgRank) {
            tempLoserObject[i].loseRank = tempLoserObject[i-1].loseRank;
          } else {
            tempLoserObject[i].loseRank = ( winnerCount + 1)
          }
        } 
        else 
        {
          tempLoserObject[i].loseRank = ( winnerCount + 1 );
        }
        winnerCount++;
      }
      this.completeFinalList.push(tempWinnerObject)
      this.completeFinalList.push(tempLoserObject)

    },
    getBonusPoint () {
      for(let i =0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].playerPsuScore === this.liveScoringObject.psuScore && this.resultsArray[i].playerOpponentScore === this.liveScoringObject.opponentScore ) {
          this.resultsArray[i].bonusPoint = 1.00;
        }
      }
    },
    generateFinalRankings () {
      for(let i =0; i < this.resultsArray.length;i++) {
        if (this.resultsArray[i].selectedWinner === this.liveScoringObject.winningTeam) {
          this.resultsArray[i].finalNumRank = this.resultsArray[i].winnerRank 
        } else {
          this.resultsArray[i].finalNumRank = this.resultsArray[i].loseRank 
        }
      }
      this.resultsArray.sort(function (a, b) {
        return a.finalNumRank - b.finalNumRank || a.avgRank - b.avgRank;
      });
      
    },
    calculateAwardedPoints () {
      let numOfWinners = 0;
      for(let i =0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].finalNumRank === 1) {
          numOfWinners++;
        }
      }

      for(let i =0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].finalNumRank === 1) {
          this.resultsArray[i].awardedPoints = ( ( this.resultsArray[i].finalNumRank / numOfWinners) + this.resultsArray[i].bonusPoint );
        } else {
          this.resultsArray[i].awardedPoints = this.resultsArray[i].bonusPoint;
        }
        
      }
      
    },
    sortRankings () {
      const NUM_OF_RANKING_CATEGORIES = 4;
      // Cycle through all major delta categories psuscore,oppoenntscore,totaldelta,spreaddelta
      for(let i =1; i < NUM_OF_RANKING_CATEGORIES +1;i++) {
        this.organizeRanks(i);
        this.assignRanks(i);
      }
      
      // Get Final Average 
      for(let i =0; i < this.resultsArray.length;i++) {
        let total= (this.resultsArray[i].psuRank + this.resultsArray[i].opponentRank +  this.resultsArray[i].totalDeltaRank +  this.resultsArray[i].spreadDeltaRank);
        this.resultsArray[i].avgRank = ( total / 4 );
      }
      
      // Organize By Final Average this.resultsArray Now Organized Lowest AvgRank - Highest AvgRank
      this.organizeRanks(5);
      this.assignRanks(5)
    
      this.getWinnerLoseRank();
      this.getBonusPoint();
      this.generateFinalRankings();
      this.calculateAwardedPoints();
    },
    startCalculations () {

      this.getLiveSpreads()
      this.firebaseUserData.forEach((el) => {
        this.getUserGuessSpreads(el)
      })
      this.sortRankings()
      //this.calculateRankings() // should be computed call
    
    },
    saveToFireBase () {
      
      if(this.currentGameObject.Status === 'Final' || this.currentGameObject.Status === 'F/OT' ) {
        db.collection(`${this.currentSeason}_Season_Rankings`).get().then(querySnapshot =>{
          querySnapshot.forEach((doc)=>{
            if(!querySnapshot.empty) {
              let player = this.resultsArray.find(x => x.player === doc.data().Player);
              // Check if the Week in Firebase is not equal to current week if it is it means the averages were already added for currentWeek
              if(doc.data().Week !== this.currentWeek) {
                db.collection(`${this.currentSeason}_Season_Rankings`).doc(`Player_${doc.data().Player}`).set({
                  Player: doc.data().Player,
                  Average: ( player.finalNumRank + doc.data().Average ),//( player.avgRank + doc.data().Average ),
                  Points: (player.awardedPoints + doc.data().Points ),
                  Week: this.currentWeek,
                  GameCounter: doc.data().GameCounter +1 
                })
              }
            }
            else {
              for(let i =0;i<this.resultsArray.length;i++) {
                db.collection(`${this.currentSeason}_Season_Rankings`).doc(`Player_${doc.data().Player}`).set({
                  Player: this.resultsArray[i].player,
                  Average:  this.resultsArray[i].avgRank,
                  Points: this.resultsArray[i].awardedPoints,
                  Week: this.currentWeek
                })
              }
            }
            
          })
        })
      }
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
        
      }).then(()=> {
        this.saveToFireBase()
      })
    },
  },
  created () 
  {
    // Get Current Time in format 2019-01-15T15:00:00
    const currentTime = moment().format('YYYY-MM-DDTHH:mm:ss')
    // Convert Current Game Objects DateTime To DateTime Of Game Start Time
    const gameStartDate = moment(this.currentGameObject.DateTime).format('YYYY-MM-DDTHH:mm:ss')
    // Check If Current Time Is Greater Than or Equal To Game Start Time If True Lock Save Btn & Inputs
    if ( currentTime >= gameStartDate ) 
    {
      for(let i =0; i < 4; i++) {
        this.homeTeamScore += this.currentGameObject.Periods[i].HomeScore === null ? 0 : this.currentGameObject.Periods[i].HomeScore;
        this.awayTeamScore += this.currentGameObject.Periods[i].AwayScore === null ? 0 : this.currentGameObject.Periods[i].AwayScore;
      }
      setTimeout(() => {
        this.getPlayerData();  
      }, 1000);
      
    }
    
  }
}

</script>

<style>
.exportStyle {
  background-color: lightblue;
  padding:10px
}
</style>