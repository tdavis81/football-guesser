let isAndroid = /(android)/i.test(navigator.userAgent);
let isIphone = /(iphone)/i.test(navigator.userAgent)
if(!isIphone) {
  importScripts('https://www.gstatic.com/firebasejs/5.5.6/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/5.5.6/firebase-messaging.js');

  const config = {
    apiKey: "AIzaSyA7iDaCYCAt3bswTe3LIlYhL1TDG-2q03A",
    authDomain: "fanastyfootball-aaebb.firebaseapp.com",
    databaseURL: "https://fanastyfootball-aaebb.firebaseio.com",
    projectId: "fanastyfootball-aaebb",
    storageBucket: "fanastyfootball-aaebb.appspot.com",
    messagingSenderId: "20047890542",
    appId: "1:20047890542:web:99b833b658a3eb0f"
  };
  firebase.initializeApp(config)

  const messaging = firebase.messaging();
  messaging.setBackgroundMessageHandler((payload) => {
    const title = 'HartranftCup Alert';
    const options = { 
      body: payload.data.message
    };
    return self.registration.showNotification(title,options)
  })


}
