<template>
  <v-ons-page>

    <!-- Login Modal -->
    <v-ons-modal :visible="modalVisible">
      <div class="login" style="margin-top:5%">
        <img src="@/assets/ff.png" class="headerImage" style="margin-bottom:10%"/>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <input type="email" v-model="user.email" class="fadeIn second" placeholder="Email" required>
                <input type="password" v-model="user.password" class="fadeIn third" placeholder="Password" required>
                <div class="row" style="margin-top:10px">
                    <div class="col-sm-6">
                        <input style="width:85%;text-align:center" type="submit" class="fadeIn fourth" value="Login" @click="checkUser()">
                    </div>
                    <div class="col-sm-6">
                        <a href="#" style="color:white">Forgot your password?</a>
                    </div>
                    <div class="col-sm-6" style="margin-top:10px">
                      <a v-if="isBeforeWeekOne" href="#" style="color:white">Create Account!</a>
                    </div>
                </div>
                <p v-if="showError" style="color:red">Incorrect username or password.</p>
            </div>
            <div class="col-md-4"></div>
      </div>
      </div>
    </v-ons-modal>

    <!-- Current Week + Game Label -->
    <v-ons-list>
      <ons-list-item>
        <div class="center">
          <label>{{currentGame.AwayTeam}} at {{currentGame.HomeTeam}} - Week {{currentGame.Week}}</label>
        </div>
      </ons-list-item>

      <!-- Penn State Score Input box -->
      <v-ons-list-item :modifier="md ? 'nodivider' : ''" id="psuScore">
        <div class="left">
          <v-ons-icon icon="md-home" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center" style="width:100%">
          <v-ons-input  float maxlength="20"
            placeholder="PENNST Score"
            v-model="psuScore"
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <!-- Opponent Score Input Box -->
      <v-ons-list-item :modifier="md ? 'nodivider' : ''" id="opponentScore">
        <div class="left">
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center" style="width:100%">
          <v-ons-input  float maxlength="20"
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
          <v-ons-select style="width: 100%;text-align:center" v-model="selectedWinner">
            <option v-for="(item,index) in opponents" :value="item.value" :key="index">
              {{ item.text }}
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
      APIKey:'aece277790af4bbdaec038cb6d0ad4d5', // UPDATE TO ACCOUNT APIKEY
      URL:'https://api.sportsdata.io',
      modalVisible: false,
      DEBUG: true,
      showError: false,
      opponents: [],
      selectedWinner: 'PENNST',
      isBeforeWeekOne: true,
      psuScore: '',
      opponentScore: '',
      hasSubmitted:false,
      currentGame: {},
      currentWeek: 0,
      currentSeason: 0,
      user: {
        email: '',
        password: '',
        displayName: ''
      },
    }
  },
  methods: 
  {
    // Display Login Modal
    showModal() 
    {
      this.modalVisible = true;
    },

    // Check User Credentials On Login Button In Modal
    checkUser() 
    {
      firebase.auth().signInWithEmailAndPassword(this.user.email,this.user.password).then(
        () => {
          this.showError = false
          this.modalVisible = false;
        },
        () => {
          this.showError = true
          this.modalVisible = true;
        }
      )
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
        this.getCurrentGame()
      })

    },
    
    // GET Current Game Object
    getCurrentGame() 
    { 
      //this.currentSeason
      fetch(`${this.URL}/v3/cfb/scores/json/GamesByWeek/${2018}/${this.currentWeek}?key=${this.APIKey}`).then((response) => {
        return response.json();
      }).then((myJson) => {
        // Find PENNST Game Via Returned JSON Array
        let psuGame = myJson.find(x => x.HomeTeam === "PENNST" || x.AwayTeam === "PENNST")
        // Set Variable to PSU Current Game Object
        this.currentGame = psuGame
        // Commit Current Game Object To Store
        this.$store.commit('currentGameObject/set', this.currentGame)
      }).then(() => {
        // Once That Compeletes, GET Session Users Submitted Scores If They Have Added Them
        db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
          if(!querySnapshot.empty) {
            querySnapshot.forEach((doc)=>{
              if(doc.data().Week === this.currentWeek && doc.data().Player === this.user.displayName) 
              {
                this.psuScore = doc.data().PsuScore
                this.opponentScore = doc.data().OpponentScore
                this.Winner = doc.data().selectedWinner
              }
            })
          }
        })

        // Get Current Time in format 2019-01-15T15:00:00
        const currentTime = moment().format('YYYY-MM-DDTHH:mm:ss')
        // Convert Current Game Objects DateTime To DateTime Of Game Start Time
        const gameStartDate = moment(this.currentGame.DateTime).format('YYYY-MM-DDTHH:mm:ss')
        
        // Check If Current Time Is Greater Than or Equal To Game Start Time If YES Lock Save Btn & Inputs
        if ( currentTime >= gameStartDate ) 
        {
          // Set inputs to readonly
          document.getElementById('psuScore').style.pointerEvents = "none";
          document.getElementById('opponentScore').style.pointerEvents = "none";
          document.getElementById('winnerDropdown').style.pointerEvents = "none";

          // Hide Save Button Once User Has Submitted There Picks
          this.hasSubmitted = true;
        }
        
        // Push Current Game Home Team && Away Team Into Array For Select Winner Dropdown
        this.opponents.push( 
          {
            text: this.currentGame.HomeTeam,
            value: this.currentGame.HomeTeam
          },
          {
            text: this.currentGame.AwayTeam,
            value: this.currentGame.AwayTeam
          }
        )


      })
    
    },

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
        db.collection(`${this.$store.state.currentYear.currentYear}_Season`).doc(`Week_${this.currentGame.Week}-Player_${this.user.displayName}`).set({
          Week: this.currentGame.Week,
          Season: this.$store.state.currentYear.currentYear,
          Winner: this.selectedWinner,
          PsuScore: parseInt(this.psuScore),
          OpponentScore: parseInt(this.opponentScore),
          Player: this.user.displayName
        }).then(function() {
          swal("Saved","Picks have been saved!","success")
        })
        .catch(function(error) {
          swal("Not Saved",error,"error")
        });
      }
      
    }
  },
  created () 
  {
    
    // Check If User Is Logged In 
    firebase.auth().onAuthStateChanged((user) => {
      
      // If User Exists -- Hide Modal, Set Display name to store, GET Current Week/Season/Game
      if (user) 
      { 
      
        this.modalVisible = false
        this.user.displayName = user.displayName
        this.$store.commit('sessionUser/set', user);
        
        this.getCurrentWeek()
        
      } 
      else 
      {
        // If User = null, Set Inputs To Blank, Show Modal
        this.user.email = '';
        this.user.password = '';
        this.modalVisible = true

        // Check If Current Time Is Before First Game Of Season, If Yes Show Create Account Link
        fetch(`${this.URL}/v3/cfb/scores/json/CurrentWeek?key=${this.APIKey}`)
        .then((response) => {
          return response.text()      
        }).then((myJson) => {
          if(myJson === null || myJson === "") {
            this.isBeforeWeekOne = true;
          } else {
            this.isBeforeWeekOne = false;
          }
        })
        
      }

    });

  }
}
</script>
