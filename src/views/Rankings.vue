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
            <tr v-for="(rank,index) in firebaseUserRankings" :key="index">
              <td>{{rank.Player}}</td>
              <td>{{rank.Points}}</td>
              <td>{{rank.Standings}}</td>
              <td>{{rank.Average}}</td>
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
            placeholder="User PENNST Score"
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
            placeholder="User Opponent Score"
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
            placeholder="User Winner"
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
      APIKey:'aece277790af4bbdaec038cb6d0ad4d5', // UPDATE TO ACCOUNT APIKEY
      URL:'https://api.sportsdata.io',
      DEBUG : true,
      userDisplayName: '',
      psuScore: '',
      opponentScore: '',
      winner: '',
      finalHomeScore: '',
      finalAwayScore: '',
      finalWinner: '',
      selectedWeek: '', 
      firebaseUserData: [],
      firebaseUserRankings: [],
      currentWeek: '',
      currentSeason: '',
      psuSchedule: [],
      rankings: [],
      players: [],
      finalRankings: []
    };
  },
  methods: {
    changeSelectedGame () {
       
      // When User Changes Previous Scores DropDown Get There Data They Entered For That Week 
      for(let i =0; i< this.firebaseUserData.length;i++) { 
       
        if(this.firebaseUserData[i].Week === this.selectedWeek && this.firebaseUserData[i].Player == this.userDisplayName) { 
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
      }).then(() =>{
        this.getCurrentWeek()  
      })
    },
    getFirebasePlayerRankings () {
      // Get all rankings
      db.collection(`${2019}_Season_Rankings`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          this.firebaseUserRankings.push({
            Player: doc.data().Player,
            Season: doc.data().Season,
            Points: doc.data().Points,
            Average: doc.data().Average,
            Standings: null
          })
        })
      }).then(() => {
        this.firebaseUserRankings.sort((a, b) => {
          let a1 = a.Points;
          let b1 = b.Points;
          return (a1 > b1) ? -1 : (a1 < b1) ? 1 : 0;
        });
        for(let i =0; i < this.firebaseUserRankings.length;i++) {
          if (i > 0) {
            if (this.firebaseUserRankings[i-1].Points === this.firebaseUserRankings[i].Points) {
              this.firebaseUserRankings[i].Standings = this.firebaseUserRankings[i-1].Standings;
            } else {
              this.firebaseUserRankings[i].Standings = i+1
            }
          } else {
            this.firebaseUserRankings[i].Standings = i+1;
          }
        }
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
          // Commit Current Week To Store
          this.$store.commit('currentWeekNumber/set', myJson)
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
        // Commit Current Year To Store
        this.$store.commit('currentYear/set', myJson)
      }).then(() => {
        // After That Event Completes, GET Current Game Object
        this.getPsuSchedule()
      })

    },
    getPsuSchedule () {
      fetch(`${this.URL}/v3/cfb/scores/json/Games/${2018}?key=${this.APIKey}`).then((response) => {
        return response.json();
      }).then((myJson) => { 
        myJson.forEach((element) => {
          if(element.HomeTeam === "PENNST" || element.AwayTeam === "PENNST") {
            this.psuSchedule.push(element);
          }
        });
      }).then(()=> {
        this.getPlayerData()
      })

    }
  },
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (this.DEBUG)
        this.userDisplayName = "Tyler"
      else 
        this.userDisplayName = user.displayName
      this.getCurrentWeek()
      this.getFirebasePlayerRankings()
    });
  }
}

</script>
