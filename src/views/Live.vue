<template>
  <v-ons-page>

    <v-ons-list>
      <v-ons-list-header>Live Tracker</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>Game Rank</th>
              <th>Winner</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr>
              <td>Bruce</td>
              <td>2.50</td>
              <td>3</td>
              <td>2.932</td>
            </tr>
            <tr>
              <td>Chris</td>
              <td>2.00</td>
              <td>4</td>
              <td>3.532</td>
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
          <v-ons-input id="homeScore" float maxlength="20"
            placeholder="Home Score"
            v-model="homeScore"
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
          <v-ons-input id="awayScore" float maxlength="20"
            placeholder="Away Score"
            v-model="awayScore"
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
import db from '@/db';

export default {
  name: "Live",
  data () {
    return {
      psuSchedule: [],
      selectedWeek: 1,
      homeScore: '',
      awayScore: '',
      winner: '',
      finalHomeScore: '',
      finalAwayScore: '',
      finalWinner: '',
      currentSeasonYear: '',
      chosenScores: [],
      liveGameRankings: [],
      playersData: [],
      currentWeek: '',
      currentGame: {},
    }
  },
  methods: {
    
    changeSelectedGame () {

      // When User Changes Previous Scores DropDown Get There Data They Entered For That Week 
      for(let i =0; i< this.chosenScores.length;i++) { 
        if(this.chosenScores[i].Week === this.selectedWeek && this.chosenScores[i].Player == "Tyler") { // add && Player == AuthSigned in displayName
          this.homeScore = this.chosenScores[i].HomeScore;
          this.awayScore = this.chosenScores[i].AwayScore;
          this.winner = this.chosenScores[i].Winner;
          break;
        } else {
          this.homeScore = 0;
          this.awayScore = 0;
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

    async getPlayerData() {
      // Get All Documents in Current Season Year From Firebase
      await db.collection(`${this.currentSeasonYear}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          this.chosenScores.push(doc.data())
          
          // If Players Datas week == current week add to playersdata array
          if(doc.data().Week === this.currentWeek) {
            this.playersData.push(doc.data())
          }

        })
      })
    }

  },
  created () {
    
    // Get Current Season Year
    this.currentSeasonYear = new Date().getFullYear();

    // Get PSU Schedule From Store
    this.psuSchedule = this.$store.state.psuSchedule.schedule;

    // Get Current Week of Year Ex Week {1}
    this.currentWeek = this.$store.state.psuCurrentWeek.currentGameWeek;

    this.getPlayerData();
    console.log(this.playersData);

    // Get The Current Game Object From PSU Schedule
    this.currentGame = this.psuSchedule.find((element) => {
      return element.Week == this.currentWeek
    });
    
  }
}

</script>
