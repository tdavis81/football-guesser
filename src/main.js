// Import Onsenui CSS
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import Vue from 'vue'
import router from './router'
import App from './App.vue'
import storeLike from './store.js';
import VueOnsen from 'vue-onsenui';
import CustomToolbar from './partials/CustomToolbar.vue';
import Vuex from 'vuex';
import AppNavigator from './AppNavigator.vue';
import moment from 'moment'

//import App from './App.vue'
//import firebase from 'firebase'
import JsonExcel from 'vue-json-excel'
 
Vue.component('downloadExcel', JsonExcel)
Vue.use(VueOnsen);
Vue.use(Vuex);


/*
const config = {
  apiKey: "AIzaSyA7iDaCYCAt3bswTe3LIlYhL1TDG-2q03A",
  authDomain: "fanastyfootball-aaebb.firebaseapp.com",
  databaseURL: "https://fanastyfootball-aaebb.firebaseio.com",
  projectId: "fanastyfootball-aaebb",
  storageBucket: "",
  messagingSenderId: "20047890542"
};

firebase.initializeApp(config)
*/
Vue.component('custom-toolbar', CustomToolbar);
Vue.config.productionTip = false

new Vue({
  router,
  store: new Vuex.Store(storeLike),
  beforeCreate() {
    // Shortcut for Material Design
    Vue.prototype.md = this.$ons.platform.isAndroid();

    // Set iPhoneX flag based on URL
    if (window.location.search.match(/iphonex/i)) {
      document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
      document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
    }

  },
  render: h => h(App), //AppNavigator
}).$mount('#app')
