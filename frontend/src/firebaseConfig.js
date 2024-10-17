// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCVTm9TAtBFuOTTH8lUTvXsYO3KlnsM35Y",
    authDomain: "yhuser-a2337.firebaseapp.com",
    projectId: "yhuser-a2337",
    storageBucket: "yhuser-a2337.appspot.com",
    messagingSenderId: "630350953898",
    appId: "1:630350953898:web:13899a592c14275743bfd3",
    measurementId: "G-887YEK784C"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };