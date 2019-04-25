<template>
  <v-ons-page>
    <v-ons-list>
      <ons-list-item>
        <div class="center">
          <v-ons-select style="width: 100%;text-align:center" @change="checkAvialable()" v-model="selectedWeek">
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
            type="number"
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
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-store" class="list-item__icon"></v-ons-icon>
        </div>
        <ons-list-item>
        <div class="center">
          <v-ons-select style="width: 100%;text-align:center" v-model="selectedOpponent">
            <option v-for="(item,index) in opponents" :value="item.value" :key="index">
              {{ item.text }}
            </option>
          </v-ons-select>
        </div>
      </ons-list-item>
      </v-ons-list-item>
      <v-ons-list-item v-if="!hasSubmitted" :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-save" class="list-item__icon"></v-ons-icon>
        </div>
         <v-ons-button  @click="saveScores()" modifier="large" class="button-margin" style="background-color:green">Save</v-ons-button>
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import db from '@/db';
const APIKey = 'aece277790af4bbdaec038cb6d0ad4d5';
const URL = 'https://api.sportsdata.io';

export default {
  data () {
    return {
      opponents: [],
      selectedWeek: '',
      selectedOpponent: 'PENNST',
      homeScore: '',
      awayScore: '',
      apiResponse: [],
      psuSchedule: [],
      gameOfWeek: {},
      currentGameWeek: '',
      currentSeasonYear: '',
      hasSubmitted:false
    };
  },
  methods: {
    filterPennStateGames () {
      for (var i=0; i < this.apiResponse.length; i++) {
        if (this.apiResponse[i].HomeTeam === "PENNST" || this.apiResponse[i].AwayTeam === "PENNST") {
          this.psuSchedule.push(this.apiResponse[i])
        } 
      }
    },
    getCurrentWeek () {
      let currentWeek = new Date();
      const dd = currentWeek.getDate();
      const mm = currentWeek.getMonth()+1; //As January is 0.
      const yyyy = currentWeek.getFullYear();
      currentWeek = `${yyyy}-${mm}-${dd}`; // Adding leading zero in and remove T00:00:00
      currentWeek = "2019-09-17T00:00:00"; // Replace this time with formatted current Time of Day

      // Find The Current Week Of The Year According to Present Day
      for (var i =0; i < this.psuSchedule.length;i++) {
        if(this.psuSchedule[i].Status === "Scheduled" && currentWeek <= this.psuSchedule[i].Day ) {
          this.selectedWeek = this.psuSchedule[i].Week;
          this.gameOfWeek = this.psuSchedule[i];
          break;
        }
      }

      // Set The Current Week EX : {1} - For Week 1
      this.currentGameWeek = this.gameOfWeek.Week;
      
      // Set The Opponents For User To Choose Winner
      this.opponents.push( 
        {
          text: this.gameOfWeek.HomeTeam,
          value: this.gameOfWeek.HomeTeam
        },
        {
          text: this.gameOfWeek.AwayTeam,
          value: this.gameOfWeek.AwayTeam
        }
      )
    },
    checkAvialable () {
      if(this.selectedWeek > this.gameOfWeek.Week) {
        alert("Cannot access future games")
        this.selectedWeek = this.gameOfWeek.Week
      } else if (this.selectedWeek < this.gameOfWeek.Week) {
        /*
        db.collection(`${this.currentSeasonYear}_Season`).get().then(querySnapshot =>{
          querySnapshot.forEach((doc)=>{
            if(doc.data().Week === this.selectedWeek) {
              console.log(doc.data())
            }
          })
        })
        */
        alert("Cannot access past games")
      }
    },
    saveScores () {
      db.collection(`${this.currentSeasonYear}_Season`).doc(`Week_${this.currentGameWeek}`).set({
        Week: this.currentGameWeek,
        Winner: this.selectedOpponent,
        HomeScore: parseInt(this.homeScore),
        AwayScore: parseInt(this.awayScore)
      }).then(function() {
        alert('Picks have been saved.');
      })
      .catch(function(error) {
        alert('I\'m sorry there was an issue with the server, your picks were not saved.')
      });

      // Set inputs to readonly
      document.getElementById('homeScore').children.readOnly = true;
      document.getElementById('awayScore').readOnly = true;

      // Hide Save Button Once User Has Submitted There Picks
      this.hasSubmitted = true;
      
    }
  },
  created () {
    this.currentSeasonYear = new Date().getFullYear();
    // Create new Firebase collection for season if its not already created 

    fetch(`${URL}/v3/cfb/scores/json/Games/${this.currentSeasonYear}?key=${APIKey}`)
    .then((response) => {
      return response.json();
    })
    .then((myJson) => {
      this.apiResponse = myJson
      this.filterPennStateGames();
      this.getCurrentWeek();
    });
  }
  
};
</script>
