<template>
  <v-ons-page>
    <v-ons-list style="text-align:center">
      
      <v-ons-icon style="font-size:115px" icon="md-face" class="list-item__icon"></v-ons-icon>
      <v-ons-list-header>User Information</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-email" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input float maxlength="70"
            placeholder="User Email"
            v-model="user.email"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

       <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-account-box" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input float maxlength="70"
            placeholder="User Display Name"
            v-model="user.displayName"
            type="text"
            readonly
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

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
      user: '',
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
      firebase.auth().signOut().then(() => {
        window.location.reload();
      }).catch((error) => {
        swal('Cannot signout at this time.',error,'error')
      });
    },
  },
  created() {
    this.user = firebase.auth().currentUser;
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