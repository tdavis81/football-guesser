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
          <v-ons-icon icon="md-home" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input :disabled="hasSubmitted"  float maxlength="20"
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
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input :disabled="hasSubmitted" float maxlength="70"
            placeholder="Opponent Score"
            v-model="opponentScore"
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <!-- Choose Winner Dropdown -->
      <v-ons-list-item :modifier="md ? 'nodivider' : ''" id="winnerDropdown">
        <div class="left">
          <v-ons-icon icon="md-store" class="list-item__icon"></v-ons-icon>
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
      </v-ons-list-item>
      
      <!-- Save Button -->
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

// Reference To Firebase DB
import db from '@/db';
// Reference To Firebase Auth
import firebase from 'firebase';
// Reference To Sweet Alerts
import swal from 'sweetalert';
// Reference to Moment JS 
import moment from 'moment'

export default {
  data () 
  {
    return {
      psuScore: '',
      opponentScore: '',
      selectedWinner: 'PENNST',
      currentWeek: this.$store.state.currentWeekNumber.Week,
      currentSeason: this.$store.state.currentSeason.Season,
      currentGame: this.$store.state.currentGameObject.Game,
      opponents:  this.$store.state.currentGameOpponents.Opponents,
      user: '',
      hasSubmitted:false,
      hourStartAlert: '1 Hour until game time, please submit your picks.'
    }
  },
  methods: 
  {
  
    // Save Scores to Firebase
    saveScores () 
    {     
      // If Inputs are Null, Alert Message
      if ( (this.psuScore === null || this.psuScore === "") ||  (this.opponentScore === null || this.opponentScore === "") ) 
      {
        swal("Error","Scores cannot be blank","error")
      } 
      else 
      {
        // Create Collection And Document If It Doesnt Exist Already 
        db.collection(`${this.currentSeason}_Season`).doc(`Week_${this.currentGame.Week}-Player_${this.user.displayName}`).set({
          Week: this.currentGame.Week,
          Season: this.currentSeason,
          Winner: this.selectedWinner,
          PsuScore: parseInt(this.psuScore),
          OpponentScore: parseInt(this.opponentScore),
          Player: this.user.displayName,
          UserID: this.user.uid
        }).then(() => {
          swal("Saved","Picks have been saved!","success")
        })
        .catch(function(error) {
          swal("Not Saved",error,"error")
        });
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
        // Hide Save Button Once User Has Submitted There Picks
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
  },
  created () 
  {
    this.user = firebase.auth().currentUser;
    this.checkIfGameStarted();
    this.getUserCurrentWeekScore()
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