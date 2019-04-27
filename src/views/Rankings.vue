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
      <v-ons-list-item :modifier="md ? 'nodivider' : ''">
        <table class="table table-striped table-dark">
          <thead style="text-align:center">
            <tr>
              <th>Player</th>
              <th>Points</th>
              <th>Standing</th>
              <th>Average Rank</th>
            </tr>
            
          </thead>
          <tbody style="text-align:center">
            <tr>
              <td>Bruce</td>
              <td>2.50</td>
              <td>3</td>
              <td>2.932</td>
            </tr>
            <tr>
              <td>Chris</td>
              <td>2.00</td>
              <td>4</td>
              <td>3.532</td>
            </tr>
            <tr>
              <td>Dan</td>
              <td>0.00</td>
              <td>6</td>
              <td>4.532</td>
            </tr>
            <tr>
              <td>Louie</td>
              <td>4.50</td>
              <td>1</td>
              <td>2.832</td>
            </tr>
            <tr>
              <td>Morrie</td>
              <td>1.00</td>
              <td>5</td>
              <td>3.9393</td>
            </tr>
            <tr>
              <td>Ron</td>
              <td>4.00</td>
              <td>2</td>
              <td>3.03</td>
            </tr>
          </tbody>
        </table>
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import firebase from 'firebase';
import router from '@/router'
import swal from 'sweetalert';
export default {
  
  name: "Rankings",
  data() {
    return {
      modalVisible: false,
      showError: false,
      user: {
        email: '',
        password: ''
      }
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
    }
  },
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.modalVisible = false
      } else {
        this.user.email = '';
        this.user.password = '';
        this.modalVisible = true
      }
    });
  }
}

</script>
