import React, { useEffect } from "react";
import { AppProps } from "next/app";

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

import "./styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyBPK3akiGwl9Kv9JP1rWOrJBN-G8GXCXus",
      authDomain: "qr-sstinc-org.firebaseapp.com",
      databaseURL: "https://qr-sstinc-org.firebaseio.com",
      projectId: "qr-sstinc-org",
      storageBucket: "qr-sstinc-org.appspot.com",
      messagingSenderId: "94752341969",
      appId: "1:94752341969:web:a894d3477159dae17aaaf0",
      measurementId: "G-NT19WZM37B",
    };

    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    firebase
      .auth()
      .getRedirectResult()
      .then(function (result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // var token = result.credential;
        }
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        db.collection("users")
          .add({
            displayName: user.displayName,
            emailAddress: user.email,
          })
          .then(function (docRef) {
            console.log("Successful document written with ID: ", docRef.id);
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  });

  return <Component {...pageProps} />;
}
