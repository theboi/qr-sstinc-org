import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import style from "./style.module.css";
import hash from "crypto-js/sha256";

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

    firebase
      .auth()
      .getRedirectResult()
      .then(function (result) {
        loadingOverlayRef.current.style.display = "none";

        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // let token = result.credential;
        }
        let user = result.user;
        console.log(user);
        firebase
          .firestore()
          .collection(`users`)
          .add({
            displayName: user.displayName,
            emailAddress: user.email,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
          })
          .then((docRef) => {
            updateDebugMessage(`Success`);
            console.log(`Successful document written with ID: ${docRef.id}`);
          })
          .catch((error) => {
            updateDebugMessage(`Error`);
            console.error(`Error adding document: ${error}`);
          });

        // firebase
        //   .database()
        //   .ref(`users/${user.uid}`)
        //   .set({
        //     email: user.email,
        //     name: user.displayName,
        //     date: firebase.database.ServerValue.TIMESTAMP,
        //   })
        //   .then((res) => {
        //     console.log(res)
        //     updateDebugMessage(`Success`);
        //     console.log(`Success`);
        //   })
        //   .catch((err) => {
        //     updateDebugMessage(`Error: ${err}`);
        //     console.error(`Error adding document: ${err}`);
        //   });
      })
      .catch(function (error) {
        console.warn(`${error.message} (Ignore if you have yet to log in)`);
      });
  });

  let loadingOverlayRef = useRef(null);

  return (
    <div className={style.main}>
      <a href="https://sstinc.org" rel="noreferrer noopener" target="_blank">
        <img
          src="/assets/sstinc-icon.png"
          alt="SST Inc Icon"
          width={100}
          height={100}
        />
      </a>
      <div className={style.contentDiv}>
        <h3>SST Inc Attendance Scanner</h3>
        <p>
          Kindy scan the given QR code below. A prompt will appear if
          successful.
        </p>
        <QrReader
          delay={500}
          onError={(error: Error) => {
            console.error(`${error}`);
            if (error.name === "NotAllowedError")
              return updateDebugMessage(`Error: Please enable your camera`);
            else if (error.name === "NoVideoInputDevicesError")
              return updateDebugMessage(
                `Error: No camera found (Please use Safari if on iOS)`
              );
            updateDebugMessage(`Error: ${error.name}`);
          }}
          onScan={(result) => {
            const twoDigitify = (value: number) =>
              ("0" + value.toString()).slice(-2);
            const date = new Date();
            const hashed = hash(
              `sstinc${twoDigitify(date.getDate())}${twoDigitify(
                date.getMonth() + 1
              )}${twoDigitify(date.getFullYear())}`
            ).toString();
            console.log(date.getMonth());
            if (result === hashed) {
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
              switch (debugMessage) {
                case "Error":
                  return "#ff6c2d";
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
        <div className={style.loadingOverlay} ref={loadingOverlayRef}>
          <svg
            className={style.loadingCircle}
            width="100"
            height="100"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            display="block"
          >
            <circle
              cx="50"
              cy="50"
              fill="none"
              stroke="#ff4a22"
              strokeWidth="10"
              r="35"
              strokeDasharray="164.93361431346415 56.97787143782138"
              transform="rotate(287.844 50 50)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                dur="1s"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
              />
            </circle>
          </svg>
        </div>
      </div>
      <p className={style.about}>
        Created by{" "}
        <a className={style.link} href="https://ryanthe.com">
          Ryan The
        </a>{" "}
        from SST Inc | 2020 | v1.0
      </p>
    </div>
  );
}
