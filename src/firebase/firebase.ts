import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyATa1I0XbQ_CQV5G8S5MLxKoKTUpyK8UbM",
  authDomain: "hm-projects-be4d6.firebaseapp.com",
  projectId: "hm-projects-be4d6",
  storageBucket: "hm-projects-be4d6.appspot.com",
  messagingSenderId: "560024993874",
  appId: "1:560024993874:web:3cb029d03363a338849f8b"
};

// Check if Firebase app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app };


