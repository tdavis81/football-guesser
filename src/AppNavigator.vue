<template>
  <v-ons-navigator swipeable swipe-target-width="50px"
    :page-stack="pageStack"
    :pop-page="storePop"
    :options="options"
    @postpush="showPopTip"
    :class="{ 'border-radius': borderRadius }"
  ></v-ons-navigator>
</template>

<script>
import AppSplitter from './AppSplitter.vue';

export default {
  beforeCreate() {
    this.$store.commit('navigator/push', AppSplitter);
  },
  data() {
    return { 
      shutUp: this.md
    }
  },
  computed: {
    pageStack() {
      return this.$store.state.navigator.stack;
    },
    options() {
      return this.$store.state.navigator.options;
    },
    borderRadius() {
      return new URL(window.location).searchParams.get('borderradius') !== null;
    }
  },
  methods: {
    storePop() {
      this.$store.commit('navigator/pop');
    },
    showPopTip() {
      !this.shutUp && this.$ons.notification.toast({
        message: 'Try swipe-to-pop from left side!',
        buttonLabel: 'Shut up!',
        timeout: 2000
      }).then(i => this.shutUp = i === 0);
    }
  },
  created () {
     // GET current year schedule
    const APIKey = 'aece277790af4bbdaec038cb6d0ad4d5';
    const URL = 'https://api.sportsdata.io';
    let currentWeek = new Date();
    let dd = currentWeek.getDate();
    let mm = currentWeek.getMonth()+1; 
    const currentYear = currentWeek.getFullYear();
    const time = currentWeek.getHours() + ":" + currentWeek.getMinutes() + ":" + currentWeek.getSeconds();
    let psuSchedule = [];
    let currentGameWeekNumber = 0;
    let currentGameObject = {};

    mm = mm < 10 ? `0${mm}`: mm;
    dd = dd < 10 ? `0${dd}`: dd;
    currentWeek = `${currentYear}-${mm}-${dd}T${time}`;

    fetch(`${URL}/v3/cfb/scores/json/Games/${currentYear}?key=${APIKey}`)
    .then((response) => {
      return response.json();
    })
    .then((myJson) => {

      myJson.forEach((element) => {
        if(element.HomeTeam === "PENNST" || element.AwayTeam === "PENNST") {
          psuSchedule.push(element);
        }
      });
      
      for (let element of psuSchedule) {
        if(element.Status === "Scheduled" && currentWeek <= element.Day ) {
          currentGameWeekNumber = element.Week;
          currentGameObject = element;
          this.$store.commit('psuSchedule/set', psuSchedule)
         
          this.$store.commit('currentYear/set', currentYear)
          this.$store.commit('currentWeekNumber/set', currentGameWeekNumber)
          //this.$store.commit('currentGameObject/set', currentGameObject)
          break;
        }
      }
      /*
      fetch(`${URL}/v3/cfb/scores/json/GamesByWeek/${2018}/${1}?key=${APIKey}`)
      .then((response) => {
        return response.json();
      }).then((myJson) => {
        for (let game of myJson) {
          if(game.HomeTeam === "PENNST" || game.AwayTeam === "PENNST" ) {
            //this.$store.commit('currentGameObject/set', game)
            break;
          }
        }
      })
      */
    })
  }
};
</script>
