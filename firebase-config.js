// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFWYGEh1S9sMZP9Z-9P_wIwX6mLOwMRhA",
  authDomain: "placeospace.firebaseapp.com",
  projectId: "placeospace",
  storageBucket: "placeospace.firebasestorage.app",
  messagingSenderId: "518428232850",
  appId: "1:518428232850:web:633f6893a16ca7c688ea4b"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize the Database (the most important line!)
const db = firebase.firestore();