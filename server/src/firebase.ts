import firebase from "firebase/app";

import "firebase/analytics";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJVu62cKWwW18uE0O8HGq2295kdd3Aq5U",
  authDomain: "flow-babad.firebaseapp.com",
  projectId: "flow-babad",
  storageBucket: "flow-babad.appspot.com",
  messagingSenderId: "627160698842",
  appId: "1:627160698842:web:81ddddd5313c7ad3b87ae3",
  measurementId: "G-Z9GS5VR72V",
};

const app = firebase.initializeApp(firebaseConfig);

export const db = app.firestore();
export const auth = app.auth();
