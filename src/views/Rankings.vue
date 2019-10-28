<style>

</style>
<template>
  <v-ons-page>
    
    <!-- Rankings Table -->
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
            <tr v-for="(rank,index) in firebaseUserRankings" :key="index">
              <td>{{rank.Player.substring(0,4)}}</td>
              <td>{{rank.Points}}</td>
              <td>{{rank.Standings}}</td>
              <td>{{rank.Average.toFixed(2)}}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="isRankingsUpdated" style="font-style:italic">Rankings Updated As Of: {{currentDate}}</p>
      </v-ons-list-item>
    </v-ons-list>

    <!--
    <v-ons-list>

       Previous Scores Section 
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

       Session User Submitted Penn State Score
      <v-ons-list-header>User Submitted Scores</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <img style="width:40px" src="@/assets/psu2.png"/>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" id="psuScore" float maxlength="20"
            placeholder="User PENNST Score"
            v-model="psuScore"
            type="text"
            readonly          
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

       User Session Submitted Opponent
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <img style="width:40px" src="@/assets/helmet.png"/>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" id="opponentScore" float maxlength="20"
            placeholder="User Opponent Score"
            v-model="opponentScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

       Session User Submitted Winner
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="ion-trophy" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" float maxlength="20"
            placeholder="User Winner"
            v-model="winner"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      Live/Final Penn State Score 
      <v-ons-list-header>Final Scores</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <img style="width:40px" src="@/assets/psu2.png"/>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" float maxlength="20"
            placeholder="Final Home Score"
            v-model="finalHomeScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      Live/Final Opponent Score 
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <img style="width:40px" src="@/assets/helmet.png"/>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" float maxlength="20"
            placeholder="Final Away Score"
            v-model="finalAwayScore"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      Live/Final Winner 
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="ion-trophy" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input class="inputSize" float maxlength="20"
            placeholder="Final Winner"
            v-model="finalWinner"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

    </v-ons-list>
    -->
    <v-ons-list>
      <v-ons-list-header>Previous Game Data</v-ons-list-header>
      <ons-list-item>
        <div class="center">
          <v-ons-select style="width: 100%;text-align:center" @change="setIframeLink()" v-model="selectedWeek2">
            <option v-for="(item,index) in psuSchedule" :value="item.Week" :key="index">
              {{ item.AwayTeam }} at {{ item.HomeTeam }} - Week {{item.Week}}
            </option>
          </v-ons-select>
        </div>
      </ons-list-item>

      <iframe style="width:100%;height:300px" :src="link"></iframe>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
// Reference To Sweet Alerts Dialog Boxes
import swal from 'sweetalert';
// Reference To Firebase Database Config - User This Get Make Calls To Firebase For User Data
import db from '@/db';
// Reference To Firebase Auth
import firebase from 'firebase';
import { log } from 'util';
import moment from 'moment'

export default {
  name: "Rankings",
  data() {
    return {
      currentDate: moment().calendar(),
      isRankingsUpdated: true,
      showIFrame: false,
      spreadsheetLinks: [],
      link: '',
      user: [],
      psuScore: '',
      opponentScore: '',
      winner: '',
      finalHomeScore: '',
      finalAwayScore: '',
      finalWinner: '',
      selectedWeek: '', 
      selectedWeek2: 1,
      firebaseUserData: [],
      firebaseUserRankings: [],
      currentWeek: this.$store.state.currentWeekNumber.Week,
      currentSeason: this.$store.state.currentSeason.Season,
      currentGameObject: this.$store.state.currentGameObject.Game,
      psuSchedule: this.$store.state.psuSchedule.Schedule,
      rankings: [],
      players: [],
      finalRankings: []
    };
  },
  methods: {
    setIframeLink() {
      const doc = this.spreadsheetLinks.find(x=>x.Week === this.selectedWeek2);
      if (doc !== undefined && doc !== null) {
        this.link = `${doc.Link}&amp;single=true&amp;widget=true&amp;headers=false`;
      }
    },
    getLinks() {
      db.collection(`${this.currentSeason}_Seaon_GameResults_Docs`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          // If Players Datas week == current week add to playersdata array
          this.spreadsheetLinks.push(doc.data())
        })
        const doc = this.spreadsheetLinks.find(x=>x.Week === this.selectedWeek2);
        if (doc !== undefined && doc !== null) {
          this.link = `${doc.Link}&amp;single=true&amp;widget=true&amp;headers=false`;
        }
      })
    },
    changeSelectedGame () {
      this.finalHomeScore = 0;
      this.finalAwayScore = 0;
      this.finalWinner = "";
      
      // When User Changes Previous Scores DropDown Get There Data They Entered For That Week 
      for(let i =0; i< this.firebaseUserData.length;i++) { 
        
        if(this.firebaseUserData[i].Week === this.selectedWeek && this.firebaseUserData[i].UserID == this.user.uid) { 
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
      const selectedGame = this.psuSchedule.find(x => x.Week === this.selectedWeek);
      
      if (selectedGame.Periods.length === 0) {
        this.finalHomeScore = 0;
        this.finalAwayScore = 0;
        this.finalWinner = "Winner N/A";
      } else {
        for(let i =0; i < 4; i++) {
          this.finalHomeScore += selectedGame.Periods[i].HomeScore === null ? 0 : selectedGame.Periods[i].HomeScore;
          this.finalAwayScore += selectedGame.Periods[i].AwayScore === null ? 0 : selectedGame.Periods[i].AwayScore;
        }
        this.finalWinner = selectedGame.HomeTeamScore > selectedGame.AwayTeamScore ? selectedGame.HomeTeam: selectedGame.AwayTeam
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
      db.collection(`${2019}_Season_Rankings`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          this.firebaseUserRankings.push({
            Player: doc.data().Player,
            Week: doc.data().Week,
            Points: doc.data().Points,
            Average: doc.data().Average / (doc.data().GameCounter),
            Standings: null
          })
          if (doc.data().Week !== this.currentWeek) {
            this.isRankingsUpdated = false;
          }
        })
      }).then(() => {
        /*
        this.firebaseUserRankings.sort((a, b) => {
          let a1 = a.Points;
          let b1 = b.Points;
          return (a1 > b1) ? -1 : (a1 < b1) ? 1 : 0;
        }); */

        this.firebaseUserRankings.sort(function (a, b) {
          return b.Points - a.Points || a.Average - b.Average;
        });

        for(let i =0; i < this.firebaseUserRankings.length;i++) {
          if (i > 0) {
            if (this.firebaseUserRankings[i-1].Points === this.firebaseUserRankings[i].Points && this.firebaseUserRankings[i-1].Average === this.firebaseUserRankings[i].Average ) {
              this.firebaseUserRankings[i].Standings = this.firebaseUserRankings[i-1].Standings;
            } else {
              this.firebaseUserRankings[i].Standings = i+1;
            }
          } else {
            this.firebaseUserRankings[i].Standings = i+1;
          }
        }
      })
    },
    
  },
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
      this.getFirebasePlayerRankings();
      this.getPlayerData();
      this.getLinks();
    });
  }
}

</script>

<style>
.inputSize {
  width: 100%
}
</style>