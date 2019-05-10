<template>
  <div id="app">
    <!--<router-view/>-->
    <Login v-if="sessionIsNotActive" @loginCompleted="onChildUpdate"/>
    <AppNavigator v-if="loginCompleted && hasDataLoaded"/>
  </div>
</template> 

<script>
//import { Slide } from 'vue-burger-menu'
import AppNavigator from './AppNavigator.vue'
// Reference To Moment 
import Login from './views/Login.vue'
// Reference to Moment JS 
import moment from 'moment'
// Reference To Firebase Auth
import firebase from 'firebase';

export default {
  name: 'App',
    data () {
      return {
        hasDataLoaded:false,
        //APIKey:'aece277790af4bbdaec038cb6d0ad4d5',
        APIKey: 'ea5cda3e18c544db85a09ce8a175075b',
        URL:'https://api.sportsdata.io',
        currentGame: {},
        currentWeek: 0,
        opponents: [],
        loginCompleted: false,
        sessionIsNotActive: false,
        psuGames: []
      }
    },
    methods: {
      onChildUpdate (isCompleted) {
        this.loginCompleted = isCompleted;
        this.getCurrentWeek();
      },
      // GET Current Week Of Season
      getCurrentWeek () 
      {
        if(localStorage.getItem('timeoutTime') === null) 
        {
          localStorage.setItem('timeoutTime',moment().add(6, "days").format("DD-MM-YYYY"));
          this.getCurrentWeek();
          return;
        } 
        else 
        {
          let timeout = localStorage.getItem('timeoutTime')
          if (moment().format("DD-MM-YYYY") < moment(timeout).format('DD-MM-YYYY')) 
          {
            if(localStorage.getItem('currentGameWeek') === null) 
            {
              fetch(`${this.URL}/v3/cfb/scores/json/CurrentWeek?key=${this.APIKey}`).then((response) => {
                return response.text();
              }).then((myJson) => {
                this.currentWeek = myJson === '' || myJson === null ? 1 : JSON.parse(myJson);
                // Commit Current Week To Store EX : 1
                this.$store.commit('currentWeekNumber/set', this.currentWeek);
                localStorage.setItem('currentGameWeek', this.currentWeek);
              }).then(() => {
                // After That Event Completes, GET Current Season Value
                this.getCurrentSeason();
              })
              
            } 
            else 
            {
              this.currentWeek = sessionStorage.getItem('currentGameWeek');
              this.$store.commit('currentWeekNumber/set', this.currentWeek);   
              this.getCurrentSeason();  
            }
          } 
          else 
          {
            localStorage.removeItem('timeoutTime');
            localStorage.removeItem('currentGameWeek');
            this.getCurrentWeek();
          }
        }

      },

      // GET Current Season
      getCurrentSeason() 
      {

        fetch(`${this.URL}/v3/cfb/scores/json/CurrentSeason?key=${this.APIKey}`).then((response) => {
          return response.json();
        }).then((myJson) => { 
          // Commit Current Year To Store
          this.$store.commit('currentSeason/set', myJson)
        }).then(() => {
          // After That Event Completes, GET Current Game Object
          this.getPsuSchedule()
        })

      },
      getPsuSchedule () {
        fetch(`${this.URL}/v3/cfb/scores/json/Games/${2018}?key=${this.APIKey}`).then((response) => {
          return response.json();
        }).then((myJson) => {
          myJson.forEach((el) => {
            if(el.HomeTeam === "PENNST" || el.AwayTeam === "PENNST") {
              this.psuGames.push(el)
            }
          })
          // Commit Current Game Object To Store
          this.$store.commit('psuSchedule/set', this.psuGames)
          }).then(() => {
            this.getCurrentGame()
          }).then(() => {
            this.opponents.push( 
              {
                TeamName: this.currentGame.HomeTeam,
                Value: this.currentGame.HomeTeam
              },
              {
                TeamName: this.currentGame.AwayTeam,
                Value: this.currentGame.AwayTeam
              }
            )
            this.$store.commit('currentGameOpponents/set', this.opponents)
          }).then(()=> {
            this.hasDataLoaded = true
          })
      },
      // GET Current Game Object
      getCurrentGame() 
      { 
        // Find Curre n
        let psuGame = this.psuGames.find(x => x.Week === this.currentWeek)
        // Save Current Game Object To Variable
        this.currentGame = psuGame;
        // Commit Current Game Object To Store
        this.$store.commit('currentGameObject/set', psuGame)

      }
    },
    created () {
      
      /* GET the Current Week -> 
         Once that API Call Completes GET the Current Season -> 
         Once that API Call Completes GET the Current Game Object 
      */
      
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.$store.commit('sessionUser/set', user)
          this.sessionIsNotActive = false
          this.loginCompleted = true
          this.getCurrentWeek()
        } else {
          this.sessionIsNotActive = true
        }
      });
      
    },
    components: {
      AppNavigator,
      Login
    }, 
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
