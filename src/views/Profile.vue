<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>User Information</v-ons-list-header>
      <v-ons-list>
          <v-ons-list-item v-for="(item, index) in actions" :key="item.title"
            :modifier="md ? 'nodivider' : ''"
            @click="logout(index)"
          >
          <v-ons-button modifier="large" class="button-margin" style="background-color:red">Logout</v-ons-button>

        </v-ons-list-item>
      </v-ons-list>

    </v-ons-list>
  </v-ons-page>
</template>

<script>
import swal from 'sweetalert';
import firebase from 'firebase';
//import admin from 'firebase-admin';

export default {
  data() {
    return {
      displayName: '',
      users: [],
      user: {
        email: '',
        password: '',
        displayName: ''
      },
      actions: [
        {
          title: 'Rankings',
          icon: 'ion-home, material:md-home'
        }
      ],
    };
  },
  methods : {
    logout(index) {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
      this.$store.commit('tabbar/set', 0);
    },
  },
  created() {
    
  }
  
};
</script>

<style scoped>
.right-icon {
  margin-left: 10px;
}
.right-label {
  color: #666;
}
</style>