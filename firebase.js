
// ===============================
// FIREBASE CONFIGURATION
// ===============================


// Your Firebase project details

const firebaseConfig = {

apiKey: "AIzaSyBjuMqepGhn6MZLv1OFBMlQFNVDrDjr7V4",

authDomain: "oplord-savings.firebaseapp.com",

projectId: "oplord-savings",

storageBucket: "oplord-savings.firebasestorage.app",

messagingSenderId: "1794473489",

appId: "1:1794473489:web:6056cb5e3cef91bb60bbb0"

};




// Initialize Firebase


let db = null;



try{


firebase.initializeApp(firebaseConfig);


db = firebase.firestore();


console.log("Firebase connected");


}

catch(error){


console.log(
"Firebase connection failed",
error
);


}
