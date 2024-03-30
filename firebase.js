const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, onValue, get, child } = require("firebase/database");

const firebaseConfig2 = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// firebase constants
const app2 = initializeApp(firebaseConfig2);
const db = getDatabase(app2);

const database = {};
module.exports = database;

database.getlevels = function(fn) {
  onValue(ref(db, "/levels"), (snapshot) => {
    fn(snapshot.val());
  });
};
database.getusers = function(fn) {
  onValue(ref(db, "/userinfo"), (snapshot) => {
    fn(snapshot.val());
  });
};
database.set = function(path, value) {
  set(ref(db, path), value);
};