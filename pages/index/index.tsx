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
  const [debugMessage, updateDebugMessage] = useState(
    `If you're reading this its too late...`
  );

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.GOOGLE_API_KEY,
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
        // console.log(user);
        db.collection(`users`)
          .add({
            displayName: user.displayName,
            emailAddress: user.email,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
          })
          .then((docRef) => {
            updateDebugMessage(`Success: ${docRef.id}`);
            console.log(`Successful document written with ID: ${docRef.id}`);
          })
          .catch((error) => {
            updateDebugMessage(`Error: ${error}`);
            console.error(`Error adding document: ${error}`);
          });
      })
      .catch(function (error) {
        console.warn(`${error.message} (Ignore if you have yet to log in)`);
      });
  });

  return (
    <div className={style.main}>
      <img
        src="/assets/sstinc-icon.png"
        alt="SST Inc. Icon"
        width={100}
        height={100}
      />
      <div className={style.content}>
        <h3 className={style.header}>SST Inc. Attendance Scanner</h3>
        <p className={style.desc}>
          Kindy scan the given QR code below. A prompt will appear if
          successful.
        </p>
        <QrReader
          delay={500}
          onError={(error: Error) => {
            console.error(`${error}`);
            if (error.name === "NotAllowedError")
              return updateDebugMessage(`Error: Please enable your camera`);
            updateDebugMessage(`Error: ${error.name}`);
          }}
          onScan={(result) => {
            const message = new Date().getDate();
            const nonce = "sstinc";
            const hashed = sha256(nonce + message).toString();
            if (result === hashed) {
            // if (result !== null) {
              console.log("pass");
              var provider = new firebase.auth.GoogleAuthProvider();
              firebase.auth().signInWithRedirect(provider);
            }
          }}
          className={style.qr}
        />
        <p
          className={style.debug}
          style={{
            backgroundColor: (() => {
              switch (debugMessage.split(":")[0]) {
                case "Error":
                  return "red";
                case "Success":
                  return "green";
                default:
                  return "transparent";
              }
            })(),
          }}
        >
          {debugMessage}
        </p>
      </div>
      <p className={style.about}>
        Created by <a href="https://ryanthe.com">Ryan The</a> from SST Inc. |
        2020 | v1.0
      </p>
    </div>
  );
}
