import firebase from 'firebase'
import 'firebase/firestore'

//const settings = {timestampsInSnapshots: true};

const config = {
    apiKey: "AIzaSyA7iDaCYCAt3bswTe3LIlYhL1TDG-2q03A",
    authDomain: "fanastyfootball-aaebb.firebaseapp.com",
    databaseURL: "https://fanastyfootball-aaebb.firebaseio.com",
    projectId: "fanastyfootball-aaebb",
    storageBucket: "",
    messagingSenderId: "20047890542"
  };
const firebaseapp = firebase.initializeApp(config)


export default firebaseapp.firestore()