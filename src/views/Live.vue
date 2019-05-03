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
      this.addToResultsArray(player,psuDelta,opponentDelta,selectedWinner,totalDelta,spreadDelta);
    
    
    },
    addToResultsArray (player,psuDelta,opponentDelta,selectedWinner,totalDelta,spreadDelta) {
      
      this.resultsArray.push({
        player: player,
        selectedWinner: selectedWinner,
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
        awardedPoints: null
      })
      
    },
    sortRankings () {
      
      this.resultsArray.sort(function(a, b) {
        var a1 = a.psuDelta
        var b1 = b.psuDelta
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      for(let i=0; i < this.resultsArray.length;i++) {
        this.resultsArray[i].psuRank = i+1;
      }

      this.resultsArray.sort(function(a, b) {
        var a1 = a.opponentDelta
        var b1 = b.opponentDelta
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      for(let i=0; i < this.resultsArray.length;i++) {
        this.resultsArray[i].opponentRank = i+1;
      }

      this.resultsArray.sort(function(a, b) {
        var a1 = a.totalDelta
        var b1 = b.totalDelta
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      for(let i=0; i < this.resultsArray.length;i++) {
        this.resultsArray[i].totalDeltaRank = i+1;
      }

      this.resultsArray.sort(function(a, b) {
        var a1 = a.spreadDelta
        var b1 = b.spreadDelta
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      for(let i=0; i < this.resultsArray.length;i++) {
        this.resultsArray[i].spreadDeltaRank = i+1;
      }

      for(let i=0; i < this.resultsArray.length;i++) {
        let totalRankPoints = ( this.resultsArray[i].psuRank + this.resultsArray[i].opponentRank + this.resultsArray[i].totalDeltaRank + this.resultsArray[i].spreadDeltaRank ); 
        let avgRank = ( totalRankPoints / 4 );
        this.resultsArray[i].avgRank = avgRank;
      }

      this.resultsArray.sort(function(a, b) {
        var a1 = a.avgRank
        var b1 = b.avgRank
        return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
      });

      for(let i=0; i < this.resultsArray.length;i++) {
        this.resultsArray[i].finalNumRank = i+1;
      }
      
      for(let i=0; i < this.resultsArray.length;i++) {
        if (i == 0)
          this.resultsArray[i].awardedPoints = 1.00;
        else 
          this.resultsArray[i].awardedPoints = 0.00;
      }
      

    },
    startCalculations () {

      this.getLiveSpreads()
      this.firebaseUserData.forEach((el) => {
        this.getUserGuessSpreads(el)
      })
      this.sortRankings()
      console.log(this.resultsArray)
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
