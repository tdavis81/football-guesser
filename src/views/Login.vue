<template>
  <div class="login" >
    <v-ons-page>
    
    <!-- Login Modal -->
    <v-ons-modal :visible="modalVisible" style="overflow-y: auto;overflow-x: auto;">
      <div  class="login" style="margin-top:5%">
        <img src="@/assets/jopa.png" class="headerImage" style="margin-bottom:5%;width: 350px;height:350px"/>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <input type="email" v-model="user.email" class="fadeIn second" placeholder="Email" required>
                <input type="password" v-model="user.password" class="fadeIn third" placeholder="Password" required>
                <div class="row" style="margin-top:10px">
                    <div class="col-sm-12">
                        <input style="width:85%;text-align:center" type="submit" class="fadeIn fourth" value="Login" @click="checkUser()">
                    </div>
                    <div class="col-sm-6">
                        <a href="#" @click="showForgotPasswordPage()" style="color:white">Forgot your password?</a>
                    </div>
                    <div class="col-sm-6" style="margin-top:10px">
                      <a v-if="isBeforeWeekOne" @click="showCreateAccountPage()" href="#" style="color:white">Create Account!</a>
                    </div>
                </div>
                <p v-if="showError" style="color:red">{{errorMsg}}</p>
            </div>
            <div class="col-md-4"></div>
        </div>
      </div>
    </v-ons-modal>
    
    <!-- Forgot Password -->
    <v-ons-modal :visible="forgotPasswordVisible">
      <div class="login">
        <img src="@/assets/ff.png" class="headerImage" style="margin-bottom:5%;width: 350px;height:350px"/>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <input type="email" v-model="user.email" class="fadeIn second" placeholder="Email" required>
                <div class="row" style="margin-top:10px">
                    <div class="col-sm-6">
                        <input style="width:85%;text-align:center" type="submit" class="fadeIn fourth" value="Reset" @click="resetPassword()">
                    </div>
                </div>
                <p v-if="showError" style="color:red">{{errorMsg}}</p>
                <v-ons-button  @click="forgotPasswordVisible = false;modalVisible = true;showError =false;this.user.email = '',this.user.password=''" modifier="small" class="button-margin" style="background-color:red">Close</v-ons-button>
            </div>
            <div class="col-md-4"></div>
        </div>
      </div>
    </v-ons-modal>

    <!-- Show Create Account -->
    <v-ons-modal :visible="createAccountVisible"  style="overflow-y: auto;overflow-x: auto;">
      <div style="margin-top:5%" class="login">
        <img src="@/assets/ff.png" class="headerImage" style="margin-bottom:1%;width: 350px;height:300px"/>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <input type="email" v-model="user.email" class="fadeIn second" placeholder="Enter Email" required>
                <input type="password" v-model="user.password" class="fadeIn third" placeholder="Enter Password" required>
                <input type="text" v-model="user.displayName" class="fadeIn fourth" placeholder="Enter Display Name" required>
                <input type="text" v-model="user.apiKey" class="fadeIn fourth" placeholder="Enter Sports Data API Key" required>
                <div class="row" style="margin-top:10px">
                    <div class="col-sm-6">
                        <input style="width:85%;text-align:center" type="submit" class="fadeIn fourth" value="Create" @click="createAccount()">
                    </div>
                </div>
                <p v-if="showError" style="color:red">{{errorMsg}}</p>
                <v-ons-button @click="createAccountVisible = false;modalVisible = true;showError =false;this.user.email = '',this.user.password=''" modifier="small" class="button-margin" style="background-color:red">Close</v-ons-button>
            </div>
            <div class="col-md-4"></div>
        </div>
      </div>
    </v-ons-modal>

  </v-ons-page>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
import firebase from 'firebase';
import router from '@/router'
import swal from 'sweetalert';
import db from '@/db';

export default {
  name: 'login',
  data () {
    return {
      APIKeyBackup: 'aece277790af4bbdaec038cb6d0ad4d5',
      APIKey: 'ea5cda3e18c544db85a09ce8a175075b',
      user: {
        email: '',
        password: '',
        displayName: '',
        userId: '',
        apiKey: '',
      },
      isBeforeWeekOne: true,
      modalVisible: true,
      forgotPasswordVisible: false,
      createAccountVisible: false,
      showError: false,
      errorMsg: '',
      isValid: false,
      currentSeason: 0
    }
  },
  methods: {
    // Display Login Modal
    showForgotPasswordPage () {
      this.modalVisible = false;
      this.forgotPasswordVisible = true;
      this.createAccountVisible = false
    },
    // Reset Password Function
    resetPassword () {
      let auth = firebase.auth();

      auth.sendPasswordResetEmail(this.user.email).then(() => {
        this.showError = false;
        this.modalVisible = true;
        this.forgotPasswordVisible = false;
        this.createAccountVisible = false
      }).catch((error) => {
        this.showError = true;
        this.errorMsg = 'Either the email doesnt exist or there is a server issue';
      });
    },
    // Display Login Modal
    showCreateAccountPage () {
      this.user.email = '',
      this.user.password = '',
      this.user.displayName = '',
      this.modalVisible = false;
      this.forgotPasswordVisible = false;
      this.createAccountVisible = true
    },
    // Create New Account
    createAccount () {
      let displayName = this.user.displayName;
      let apiKey = this.user.apiKey;

      // check if null , check if display name exists already/ login user hide models
      if (this.user.email === '' || this.user.email === null || this.user.password === '' || this.user.password === null || this.user.displayName === '' || this.user.displayName === null) {
        this.showError = true;
        this.errorMsg = 'Fields cannot be blank.';
      }
      else {
        this.showError = false;
        fetch(`https://api.sportsdata.io/v3/cfb/scores/json/CurrentWeek?key=${this.user.apiKey}`).then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          } else {
            this.isValid = true 
          }
        }).catch((error)=> {
          this.errorMsg="API Key is not valid"
          this.showError = true;
          this.isValid = false;
        });
        
        // Check If Username already Exists Here
        db.collection(`${this.currentSeason}_Season`).get().then(querySnapshot =>{
          for (var i in querySnapshot.docs) {
            const doc = querySnapshot.docs[i]
            if(doc.data().Player === this.user.displayName) {
              this.errorMsg="Display Name Already Exists."
              this.showError = true;
              this.isValid = false;
              break;
            }
            else {
              this.isValid = true
            }
          }
        })
        if(this.isValid) {
          firebase.auth().createUserWithEmailAndPassword(this.user.email, this.user.password)
          .then(()=> {
            firebase.auth().signInWithEmailAndPassword(this.user.email,this.user.password)
            .then(()=> {
              firebase.auth().currentUser.updateProfile({
                displayName: displayName,
                photoURL: apiKey
              }).then(()=> {
                let user = firebase.auth().currentUser;
                user.sendEmailVerification().then(() => {
                  // Login User and hide Models
                  
                  this.modalVisible = false;
                  this.forgotPasswordVisible = false;
                  this.createAccountVisible = false;
                  this.$store.commit('sessionUser/set', user)
                  this.$emit('loginCompleted', true)
                }).catch((error) => {
                  this.showError = true;
                  this.errorMsg = error;
                });
              }).catch((error) => {
                this.showError = true;
                this.errorMsg = error;
              });
            }).catch((error) => {
              this.showError = true;
              this.errorMsg = error;
            })
          })
          .catch((error) => {
            this.showError = true;
            this.errorMsg = error;
          })
        }
        
      }
      
    },  
    showModal() 
    {
      this.modalVisible = true;
    },

    // Check User Credentials On Login Button In Modal
    checkUser() 
    {

      firebase.auth().signInWithEmailAndPassword(this.user.email, this.user.password)
      .then((user) => {
        this.showError = false;
        this.modalVisible = false;
        this.$store.commit('sessionUser/set', user)
        this.$emit('loginCompleted', true)
      })
      .catch((error) => {
        this.errorMsg = error;
        this.showError = true;
        this.modalVisible = true;
      });

    },
  },
  created () {
    let user = firebase.auth().currentUser;
    if (user) {
      this.$store.commit('sessionUser/set', user)
      this.$emit('loginCompleted', true)
      this.modalVisible = false;
    } else {
      // Check if before week 1, if so display sign up button
      fetch(`https://api.sportsdata.io/v3/cfb/scores/json/CurrentWeek?key=${this.APIKey}`).then((response) => {
        return response.text()
      }).then((myJson) => {
        this.isBeforeWeekOne = myJson === '' || myJson === null ? true : false
        this.modalVisible = true;
      })
      fetch(`https://api.sportsdata.io/v3/cfb/scores/json/CurrentSeason?key=${this.APIKey}`).then((response) => {
        return response.json();
      }).then((myJson) => { 
        // Commit Current Year To Store
        this.currentSeason = myJson;
      })
    }
    

  }
}
</script>

<style>

.headerImage {
  width:45%;
  height:25%;
}

body {
  font-family: "Poppins", sans-serif;
  height: 100vh;
  overflow-x: hidden;
  width: 100%;
  position: relative
}

a {
  color: #92badd;
  display:inline-block;
  text-decoration: none;
  font-weight: 400;
}

h2 {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  display:inline-block;
  margin: 40px 8px 10px 8px; 
  color: #cccccc;
}



/* STRUCTURE */

.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column; 
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 20px;
}

#formContent {
  -webkit-border-radius: 10px 10px 10px 10px;
  border-radius: 10px 10px 10px 10px;
  background: #fff;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  position: relative;
  padding: 0px;
  -webkit-box-shadow: 0 30px 60px 0 rgba(0,0,0,0.3);
  box-shadow: 0 30px 60px 0 rgba(0,0,0,0.3);
  text-align: center;
}

#formFooter {
  background-color: #f6f6f6;
  border-top: 1px solid #dce8f1;
  padding: 25px;
  text-align: center;
  -webkit-border-radius: 0 0 10px 10px;
  border-radius: 0 0 10px 10px;
}



/* TABS */

h2.inactive {
  color: #cccccc;
}

h2.active {
  color: #0d0d0d;
  border-bottom: 2px solid #5fbae9;
}



/* FORM TYPOGRAPHY*/

input[type=button], input[type=submit], input[type=reset]  {
  background-color: green;
  border: none;
  color: white;
  padding: 15px 80px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  text-transform: uppercase;
  font-size: 13px;
  -webkit-box-shadow: 0 10px 30px 0 rgba(95,186,233,0.4);
  box-shadow: 0 10px 30px 0 rgba(95,186,233,0.4);
  -webkit-border-radius: 5px 5px 5px 5px;
  border-radius: 5px 5px 5px 5px;
  margin: 5px 20px 10px 20px;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
}

input[type=button]:hover, input[type=submit]:hover, input[type=reset]:hover  {
  background-color: #39ace7;
}

input[type=button]:active, input[type=submit]:active, input[type=reset]:active  {
  -moz-transform: scale(0.95);
  -webkit-transform: scale(0.95);
  -o-transform: scale(0.95);
  -ms-transform: scale(0.95);
  transform: scale(0.95);
}

input[type=email], input[type=password],input[type=text] {
  background-color: #f6f6f6;
  border: none;
  color: #0d0d0d;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 5px;
  width: 85%;
  border: 2px solid #f6f6f6;
  -webkit-transition: all 0.5s ease-in-out;
  -moz-transition: all 0.5s ease-in-out;
  -ms-transition: all 0.5s ease-in-out;
  -o-transition: all 0.5s ease-in-out;
  transition: all 0.5s ease-in-out;
  -webkit-border-radius: 5px 5px 5px 5px;
  border-radius: 5px 5px 5px 5px;
}

input[type=text]:focus {
  background-color: #fff;
  border-bottom: 2px solid #5fbae9;
}

input[type=text]:placeholder {
  color: #cccccc;
}



/* ANIMATIONS */

/* Simple CSS3 Fade-in-down Animation */
.fadeInDown {
  -webkit-animation-name: fadeInDown;
  animation-name: fadeInDown;
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

@-webkit-keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  100% {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  100% {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

/* Simple CSS3 Fade-in Animation */
@-webkit-keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@-moz-keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

.fadeIn {
  opacity:0;
  -webkit-animation:fadeIn ease-in 1;
  -moz-animation:fadeIn ease-in 1;
  animation:fadeIn ease-in 1;

  -webkit-animation-fill-mode:forwards;
  -moz-animation-fill-mode:forwards;
  animation-fill-mode:forwards;

  -webkit-animation-duration:1s;
  -moz-animation-duration:1s;
  animation-duration:1s;
}

.fadeIn.first {
  -webkit-animation-delay: 0.4s;
  -moz-animation-delay: 0.4s;
  animation-delay: 0.4s;
}

.fadeIn.second {
  -webkit-animation-delay: 0.6s;
  -moz-animation-delay: 0.6s;
  animation-delay: 0.6s;
}

.fadeIn.third {
  -webkit-animation-delay: 0.8s;
  -moz-animation-delay: 0.8s;
  animation-delay: 0.8s;
}

.fadeIn.fourth {
  -webkit-animation-delay: 1s;
  -moz-animation-delay: 1s;
  animation-delay: 1s;
}

/* Simple CSS3 Fade-in Animation */
.underlineHover:after {
  display: block;
  left: 0;
  bottom: -10px;
  width: 0;
  height: 2px;
  background-color: #56baed;
  content: "";
  transition: width 0.2s;
}

.underlineHover:hover {
  color: #0d0d0d;
}

.underlineHover:hover:after{
  width: 100%;
}



/* OTHERS */

*:focus {
    outline: none;
} 

#icon {
  width:60%;
}



</style>