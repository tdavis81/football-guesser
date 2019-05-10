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
              <th>Game Avg</th>
              <th>Position</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="(item,index) in resultsArray" :key="index">
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
      currentWeek: this.$store.state.currentWeekNumber.Week,
      currentSeason: this.$store.state.currentSeason.Season,
      currentGameObject: this.$store.state.currentGameObject.Game,
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
      completeFinalList: []
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
        avgRankNumber: null,
        winnerRank: null, 
        loseRank: null,
        bonusPoint: 0,
        finalNumRank: null,
        awardedPoints: 0
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
              if (this.resultsArray[i-1].spread === this.resultsArray[i].spread) {
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

      // Sort all winners by avg rank
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
      }
      
      this.completeFinalList.push(tempWinnerObject)
      this.completeFinalList.push(tempLoserObject)

    },
    getBonusPoint () {
      for(let i =0; i < this.resultsArray.length;i++) {
        if(this.resultsArray[i].psuScore === this.liveScoringObject.psuScore && this.resultsArray[i].opponentScore === this.liveScoringObject.opponentScore ) {
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
      const NUM_OF_RANKING_CATEGORIES = 5;
      // Cycle through all major delta categories psuscore,oppoenntscore,totaldelta,spreaddelta
      for(let i =1; i < NUM_OF_RANKING_CATEGORIES;i++) {
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
              db.collection(`${this.currentSeason}_Season_Rankings`).doc(`Player_${doc.data().Player}`).set({
                Player: doc.data().Player,
                Average:  ( player.avgRank + doc.data().Average ),
                Points: (player.awardedPoints + doc.data().Points ),
                Week: this.currentWeek
              })
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
    this.getPlayerData();
  }
}

</script>
