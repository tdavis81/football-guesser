<template>
  <v-ons-page>
    
    <v-ons-list>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>Points</th>
              <th>Standing</th>
              <th>Average Rank</th>
            </tr>
            
          </thead>
          <tbody style="text-align:center">
            <tr v-for="rank in finalRankings" :key="rank.Player">
              <td>{{rank.Player}}</td>
              <td>{{rank.Points}}</td>
              <td>{{rank.Standings}}</td>
              <td>{{rank.AvgRank}}</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>


    <v-ons-list>
      <v-ons-list-header>Previous Scores</v-ons-list-header>
      <ons-list-item>
        <div class="center">
          <v-ons-select style="width: 100%;text-align:center" @change="changeSelectedGame()" v-model="selectedWeek">
            <option v-for="(item,index) in psuSchedule" :value="item.Week" :key="index">
              {{ item.AwayTeam }} at {{ item.HomeTeam }} - Week {{item.Week}}
            </option>
          </v-ons-select>
        </div>
      </ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-home" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input id="psuScore" float maxlength="20"
            placeholder="PENNST Score"
            v-model="psuScore"
            type="text"
            readonly          
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input id="opponentScore" float maxlength="20"
            placeholder="Opponent Score"
            v-model="opponentScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input  float maxlength="20"
            placeholder="Winner"
            v-model="winner"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-home" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input  float maxlength="20"
            placeholder="Final Home Score"
            v-model="finalHomeScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input  float maxlength="20"
            placeholder="Final Away Score"
            v-model="finalAwayScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-store" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input  float maxlength="20"
            placeholder="Final Winner"
            v-model="finalWinner"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>


    </v-ons-list>


  </v-ons-page>
</template>

<script>
import firebase from 'firebase';
import router from '@/router'
import swal from 'sweetalert';
import db from '@/db';

export default {
  
  name: "Rankings",
  data() {
    return {
      user: this.$store.state.sessionUser.user,
      psuScore: '',
      opponentScore: '',
      winner: '',
      finalHomeScore: '',
      finalAwayScore: '',
      finalWinner: '',
      selectedWeek: '', 
      psuSchedule: [],
      firebaseUserData: [],
      currentWeek: this.$store.state.currentGameObject.gameObject.Week,
      currentSeason: this.$store.state.currentYear.currentYear,
      rankings: [],
      players: [],
      finalRankings: []
    };
  },
  methods: {
    changeSelectedGame () {
      
      // When User Changes Previous Scores DropDown Get There Data They Entered For That Week 
      for(let i =0; i< this.firebaseUserData.length;i++) { 

        if(this.firebaseUserData[i].Week === this.selectedWeek && this.firebaseUserData[i].Player == this.user.displayName) { // add && Player == AuthSigned in displayName
          this.psuScore = this.firebaseUserData[i].PsuScore;
          this.opponentScore = this.firebaseUserData[i].OpponentScore;
          this.winner = this.firebaseUserData[i].Winner;
          break;
        } else {
          this.psuScore = 0;
          this.opponentScore = 0;
          this.winner = "";
        }
      }
      // IF the game was completed get the Final Winner/Scores
      for(let i =0; i< this.psuSchedule.length;i++) {
        if(this.psuSchedule[i].Week === this.selectedWeek) {
          this.finalHomeScore = this.psuSchedule[i].HomeTeamScore
          this.finalAwayScore = this.psuSchedule[i].AwayTeamScore
          this.finalWinner = this.psuSchedule[i].HomeTeamScore > this.psuSchedule[i].AwayTeamScore ? this.psuSchedule[i].HomeTeam: this.psuSchedule[i].AwayTeam
          break;
        }
      }
      
    },
    getPlayerData() {
      // Get All Documents in Current Season Year From Firebase
      db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          // If Players Datas week == current week add to playersdata array
            this.firebaseUserData.push(doc.data())
        })
      })
    },
    getFirebasePlayerRankings () {
      // Get all rankings
      db.collection(`${this.currentSeason}_Season_Rankings`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          this.rankings.push(doc.data())
          this.players.push(doc.data().Player)
        })
      }).then(() => {
        let players= [...new Set(this.players)];
        let totalPoints = 0;
        let totalAverage = 0;
        let divideCounter = 0;

        for (let player of players)
        {
          for (let rank of this.rankings)
          {
            if (rank.Player === player) {
              divideCounter++;
              totalPoints += rank.Points
              totalAverage += rank.Average
            }
          }
          this.finalRankings.push({
            Player : player,
            Points : totalPoints,
            Standings : null,
            AvgRank : (totalAverage/divideCounter)
          })
          totalPoints = 0
          divideCounter = 0
        }
        
      }).then(() => {
        let n = this.finalRankings.length; 
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (this.finalRankings[j].Points < this.finalRankings[j + 1].Points) 
            { 
              let temp = this.finalRankings[j]; 
              this.finalRankings[j] = this.finalRankings[j + 1]; 
              this.finalRankings[j + 1] = temp; 
            } 
          }
        }
        let counter = 1
        this.finalRankings.forEach((el) => {
          el.Standings = counter;
          counter++;
        })
        console.log(this.finalRankings)
      })
      
    }
  },
  created() {

    //console.log('test')
    this.psuSchedule = this.$store.state.psuSchedule.schedule;
    this.getPlayerData()
    this.getFirebasePlayerRankings()
  }
}

</script>
