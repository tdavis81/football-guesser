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
                </div>
                <p v-if="showError" style="color:red">Incorrect username or password.</p>
            </div>
            <div class="col-md-4"></div>
      </div>
      </div>
    </v-ons-modal>


    <v-ons-list>
      <ons-list-item>
        <div class="center">
          <label>{{currentGame.AwayTeam}} at {{currentGame.HomeTeam}} - Week {{currentGame.Week}}</label>
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
          <v-ons-input id="opponentSCore" float maxlength="20"
            placeholder="Opponent Score"
            v-model="opponentScore"
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
// Set a way to lock 1day or hours before start of game

import db from '@/db';
import firebase from 'firebase';
import swal from 'sweetalert';

export default {
  data () {
    return {
      modalVisible: false,
      showError: false,
      user: {
        email: '',
        password: '',
        displayName: ''
      },
      opponents: [],
      selectedOpponent: 'PENNST',
      psuScore: '',
      opponentScore: '',
      hasSubmitted:false,
      currentGame: this.$store.state.currentGameObject.gameObject
    };
  },
  methods: {
    showModal() {
      this.modalVisible = true;
    },
    checkUser() {
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
    
    saveScores () {                                         
      db.collection(`${this.$store.state.currentYear.currentYear}_Season`).doc(`Week_${this.currentGame.Week}-Player_${this.user.displayName}`).set({
        Week: this.currentGame.Week,
        Season: this.$store.state.currentYear.currentYear,
        Winner: this.selectedOpponent,
        PsuScore: parseInt(this.psuScore),
        OpponentScore: parseInt(this.opponentScore),
        Player: this.user.displayName
      }).then(function() {
        swal("Saved","Picks have been saved!","success")
      })
      .catch(function(error) {
        swal("Not Saved","Server Error, Picks not saved. Try Again","error")
      });

      // Set inputs to readonly FIX
      const psuScore = document.getElementById('psuScore');
      psuScore.childNodes.item("child").readOnly = true;
      const opponentScore = document.getElementById('opponentScore');
      opponentScore.childNodes.item("child").readOnly = true;

      // Hide Save Button Once User Has Submitted There Picks
      this.hasSubmitted = true;
      
    }
  },
  created () {
    //console.log('test')
    firebase.auth().onAuthStateChanged((user) => {
      if (user) { 
        this.modalVisible = false
        this.user.displayName = user.displayName
        this.$store.commit('sessionUser/set', user);
      } else {
        this.user.email = '';
        this.user.password = '';
        this.modalVisible = true
      }
    });

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

  }
  
};
</script>
