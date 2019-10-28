<template>
  <v-ons-page>
    <v-ons-list>
    
      <!-- Current Week + Game Label -->
      <v-ons-list-header>Current Week</v-ons-list-header>
      <ons-list-item>
        <div class="center">
          <label>{{currentGame.AwayTeam}} at {{currentGame.HomeTeam}} - Week {{currentGame.Week}}</label>
        </div>
      </ons-list-item>

      <!-- Penn State Score Input box -->
      <v-ons-list-item :modifier="md ? 'nodivider' : ''" style="width:100%">
        <div class="left">
          <img style="width:40px" src="@/assets/psu2.png"/>
        </div>
        <label class="center">
          <v-ons-input @change="validateInputPSU()" :disabled="hasSubmitted"  float maxlength="3"
            placeholder="PENNST Score"
            v-model="psuScore"
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <!-- Opponent Score Input Box -->
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <img style="width:40px" src="@/assets/helmet.png"/>
        </div>
        <label class="center">
          <v-ons-input @change="validateInputOpponent()" :disabled="hasSubmitted" float maxlength="70"
            :placeholder="opponentName + ' Score'"
            v-model="opponentScore"
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <!-- Choose Winner Dropdown 
      <v-ons-list-item :modifier="md ? 'nodivider' : ''" id="winnerDropdown">
        <div class="left">
          <v-ons-icon style="color:blue" icon="ion-trophy" class="list-item__icon"></v-ons-icon>
        </div>
        <ons-list-item>
          <div class="center">
            <v-ons-select :disabled="hasSubmitted" style="width: 100%;text-align:center" v-model="selectedWinner">
              <option v-for="(item,index) in opponents" :value="item.Value" :key="index">
                {{ item.TeamName }}
              </option>
            </v-ons-select>
          </div>
        </ons-list-item>
      </v-ons-list-item>-->
      
      <!-- Save Button -->
      <v-ons-list-item v-if="!hasSubmitted" :modifier="md ? 'nodivider' : ''">
        <!--<div class="left">
          <v-ons-icon style="color:green" icon="md-save" class="list-item__icon"></v-ons-icon>
        </div>-->
         <v-ons-button  @click="saveScores()" modifier="large" class="button-margin" style="background-color:green">Save</v-ons-button>
      </v-ons-list-item>
      <div v-if="!hasSubmitted">
        <br/>
        <p style="margin-left:25px"> <b>Game Start Time : </b> <span style="font-style:italic">{{gameStartTime}}</span></p>
        <p style="margin-left:25px"> <b>Countdown : </b><span style="font-style:italic">{{gameCountDown}}</span></p><!--Math.trunc()-->
      </div>
    </v-ons-list>
    
    <div v-if="dataLoaded">
      <v-ons-list>
        <v-ons-list-header>Player's who have submitted picks for Week {{currentWeek}}</v-ons-list-header>
        <v-ons-list-item v-for="(item,index) in currentSubmitted" :key="index">
          <div class="left">
          <v-ons-icon style="color:green" icon="md-check-circle" class="list-item__icon"></v-ons-icon>
        </div>
          {{item.Player}}
        </v-ons-list-item>
        <v-ons-list-item v-for="(item,index) in currentUnsubmitted" :key="index+25">
          <div class="left">
          <v-ons-icon style="color:red" icon="md-close" class="list-item__icon"></v-ons-icon>
        </div>
          {{item.Player}}
        </v-ons-list-item>
      </v-ons-list>
    </div>
    
  </v-ons-page>
</template>

<script>
// Reference To Firebase DB
import db from '@/db';
// Reference To Firebase Auth
import firebase from 'firebase';
// Reference To Sweet Alerts
import swal from 'sweetalert';
// Reference to Moment JS 
import moment from 'moment'
import { log } from 'util';


export default {
  data () 
  {
    return {
      gameCountDown: '',
      countDownDays: 0,
      countDownHours: 0,
      countDownMins: 0,
      psuScore: '',
      opponentScore: '',
      dataLoaded: false,
      selectedWinner: 'PENNST',
      opponentName: '',
      currentSubmitted: [],
      currentUnsubmitted: [],
      currentWeek: this.$store.state.currentWeekNumber.Week,
      currentSeason: this.$store.state.currentSeason.Season,
      currentGame: this.$store.state.currentGameObject.Game,
      opponents:  this.$store.state.currentGameOpponents.Opponents,
      user: '',
      hasSubmitted:false,
      hourStartAlert: '1 Hour until game time, please submit your picks.',
      
    }
  },
  methods: 
  {
    validateInputPSU(inputNum) {
      const reg = /^\d+$/;

      if (this.psuScore.match(reg)) {
        if (this.psuScore >= 250) {
          this.psuScore = 0;
        }
        if (this.psuScore.length > 3) {
          this.psuScore = 0;
        }
      } else {
        this.psuScore = 0;
      }
    },
    validateInputOpponent(inputNum) {
      const reg = /^\d+$/;
      
      if (this.opponentScore.match(reg)) {
        if (this.opponentScore >= 250) {
          this.opponentScore = 0;
        } else {
        }
        if (this.opponentScore.length > 3) {
          this.opponentScore = 0;
        } else {
        }
      } else {
        this.opponentScore = 0;
      }
    },
    alphanumeric(inputtxt)
    {
      const letterNumber = /^[0-9a-zA-Z]+$/;
      try {
        if(inputtxt.match(letterNumber)) 
          return true;
        return false;
      } catch {
        return false;
      }
    },
    // Save Scores to Firebase
    saveScores () 
    {     
      
      // Get Current Time in format 2019-01-15T15:00:00
      const currentTime = moment().format('YYYY-MM-DDTHH:mm:ss')
      // Convert Current Game Objects DateTime To DateTime Of Game Start Time
      const gameStartDate = moment(this.currentGame.DateTime).format('YYYY-MM-DDTHH:mm:ss')

      // Check If Current Time Is Greater Than or Equal To Game Start Time If True Lock Save Btn & Inputs
      if ( currentTime >= gameStartDate ) 
      {
        swal("Error","Cannot submit/update score because the game has already started.","error")
        // Hide/Lock Save button and inputs
        this.hasSubmitted = true; 
      } else {
        // If Inputs are Null, Alert Message
        if ( (this.psuScore === null || this.psuScore === "") ||  (this.opponentScore === null || this.opponentScore === "") ) 
        {
          swal("Error","Scores cannot be blank / Scores cannot contain letters","error")
        } 
        else 
        {

          if (this.alphanumeric(this.psuScore) && this.alphanumeric(this.opponentScore)) {
            
            // Create Collection And Document If It Doesnt Exist Already 
            db.collection(`${this.currentSeason}_Season`).doc(`Week_${this.currentGame.Week}-Player_${this.user.displayName}`).set({
              Week: this.currentGame.Week,
              Season: this.currentSeason,
              Winner: parseInt(this.psuScore) > parseInt(this.opponentScore) ? "PENNST" : this.opponentName,
              PsuScore: parseInt(this.psuScore),
              OpponentScore: parseInt(this.opponentScore),
              Player: this.user.displayName,
              UserID: this.user.uid
            }).then(() => {
              swal("Saved","Picks have been saved!","success")
              setTimeout(() => {
                this.currentSubmitted = [];
                this.currentUnsubmitted = [];
                this.getUnsubmittedPicks();
              }, 1000);
            })
            .catch(function(error) {
              swal("Not Saved",error,"error")
            }); 
            
          } else {
            this.psuScore = 0;
            this.opponentScore = 0;
            swal("Error","Scores can only contain numbers.","error")
          }
        }
      } 
    },
    checkIfGameStarted () {
      // Get Current Time in format 2019-01-15T15:00:00
      const currentTime = moment().format('YYYY-MM-DDTHH:mm:ss')
      // Convert Current Game Objects DateTime To DateTime Of Game Start Time
      const gameStartDate = moment(this.currentGame.DateTime).format('YYYY-MM-DDTHH:mm:ss')

      // Check If Current Time Is Greater Than or Equal To Game Start Time If True Lock Save Btn & Inputs
      if ( currentTime >= gameStartDate ) 
      {
        // Hide Save Button Once gave has started
        this.hasSubmitted = true; 
      }
    },
    getUserCurrentWeekScore () {
      db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
        if(!querySnapshot.empty) 
        {
          querySnapshot.forEach((doc)=>{
            if(doc.data().Week === this.currentWeek && doc.data().UserID === this.user.uid) 
            {
              this.psuScore = doc.data().PsuScore
              this.opponentScore = doc.data().OpponentScore
              this.selectedWinner = doc.data().Winner
            }
          })
        }
      })
    },
    getUnsubmittedPicks() {
      db.collection(`${2019}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          if (doc.data().Week === this.currentWeek) {
            this.currentSubmitted.push(doc.data())
          }
        })
      }).then(() => {
        db.collection(`${2019}_Season`).get().then(querySnapshot =>{
        querySnapshot.forEach((doc)=>{
          if (this.currentWeek === 1) {
            if (doc.data().Week === this.currentWeek) {
              const found = this.currentSubmitted.find(x => x.Player === doc.data())
              if (found === null) {
                this.currentUnsubmitted.push(doc.data())
              }
            }
          } else {
            if (doc.data().Week === ( this.currentWeek -1)) {
              const found = this.currentSubmitted.find(x => x.Player === doc.data().Player)
              if (found === undefined) {
                this.currentUnsubmitted.push(doc.data())
              }
            }
          }
          
        })
      })
      })
      this.dataLoaded = true;      
    }
  },
  created () 
  {
    this.opponents.forEach(el => {
      if (el.Value !== 'PENNST') 
        this.opponentName = el.Value;
    }) 
    this.user = firebase.auth().currentUser;
    this.checkIfGameStarted();
    this.getUserCurrentWeekScore()
    this.getUnsubmittedPicks();
    this.gameStartTime = moment(this.currentGame.DateTime).calendar();

    const now = moment(new Date()); //todays date
    const end = moment(this.currentGame.DateTime)
    //const duration = moment.duration(moment(this.currentGame.DateTime).diff(now));
    //this.countDownDays = duration.asDays();
    //this.countDownHours = duration.asHours();
    //this.countDownMins = duration.minutes();

    const diff = moment.duration(moment(end).diff(moment(now)));
    const days = parseInt(diff.asDays()); //84
    let hours = parseInt(diff.asHours()); //2039 hours, but it gives total hours in given miliseconds which is not expacted.
    hours = hours - days*24;  // 23 hours
    let minutes = parseInt(diff.asMinutes()); //122360 minutes,but it gives total minutes in given miliseconds which is not expacted.
    minutes = minutes - (days*24*60 + hours*60); //20 minutes.

    this.gameCountDown = days + 'days ' + hours + 'hours ' + minutes + 'mins';

  }
}
</script>

<style>
.text-input:disabled {
  opacity: 1;
  color:black
}

ons-input[disabled] {
  opacity: 1;
}
.select-input:disabled {
  opacity: 1;
  color:black
}
</style>