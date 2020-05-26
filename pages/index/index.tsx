import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import style from "./style.module.css";
import sha256 from "crypto-js/sha256";

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

// import QrReader from "react-qr-reader"
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function App() {
  const [debugMessage, updateDebugMessage] = useState(``)

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

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    let db = firebase.firestore();

    firebase
      .auth()
      .getRedirectResult()
      .then(function (result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // let token = result.credential;
        }
        let user = result.user;
        console.log(user);
        db.collection(`users`)
          .add({
            displayName: user.displayName,
            emailAddress: user.email,
            date: firebase.firestore.Timestamp.fromDate(new Date())
          })
          .then((docRef) => {
            updateDebugMessage(`Successful document written with ID: ${docRef.id}`)
            console.log(`Successful document written with ID: ${docRef.id}`);
          })
          .catch((error) => {
            updateDebugMessage(`Error adding document: ${error}`)
            console.error(`Error adding document: ${error}`);
          });
      })
      .catch(function (error) {
        console.warn(`${error.message} (Ignore if you have yet to log in)`);
      });
  });

  return (
    <div className={style.main}>
      <h1 className={style.header}>Attendance Scanner</h1>
      <QrReader
        delay={500}
        onError={(error: Error) => {
          console.error(`${error}`)
          if (error.name === "NotAllowedError") return updateDebugMessage(`Error: Please enable your camera`)
          updateDebugMessage(`Error: ${error.name}`)
        }}
        onScan={(result) => {
          const message = new Date().getDate();
          const nonce = "sstinc";
          const hashed = sha256(nonce + message).toString();
          // if (result === hashed) {
          if (result !== null) {
            console.log("pass");
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
          }
        }}
        className={style.qr}
      />
      <p>{debugMessage}</p>
    </div>
  );
}
