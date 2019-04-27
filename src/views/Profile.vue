<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>User Information</v-ons-list-header>
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-face" class="list-item__icon"></v-ons-icon>
        </div>
        <label class="center">
          <v-ons-input float maxlength="20"
            placeholder="Display Name"
            v-model="displayName"
            type="number"
          >
          </v-ons-input>
        </label>
      </v-ons-list-item>

      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <div class="left">
          <v-ons-icon icon="md-save" class="list-item__icon"></v-ons-icon>
        </div>
         <v-ons-button modifier="large" class="button-margin" style="background-color:green">Save</v-ons-button>
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

export default {
  data() {
    return {
      displayName: '',
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
      this.$store.commit('tabbar/set', 2);
    },
  },
  
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