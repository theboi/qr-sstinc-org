import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import style from "./style.module.css";
import hash from "crypto-js/sha256";

import svgImages from "./svgImages";

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import { debug } from "console";

// import QrReader from "react-qr-reader"
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

enum LoginStatus {
  None,
  Fail,
  Success,
}

export default function App() {
  const [debugMessage, updateDebugMessage] = useState(
    `If you're reading this its too late...`
  );
  const [loginStatus, updateLoginStatus] = useState(LoginStatus.None);

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
            updateLoginStatus(LoginStatus.Success);
            console.log(`Successful document written with ID: ${docRef.id}`);
          })
          .catch((error) => {
            updateLoginStatus(LoginStatus.Fail);
            console.error(`Error adding document: ${error}`);
          });
      })
      .catch(function (error) {
        console.warn(`${error.message} (Ignore if you have yet to log in)`);
      });
  });

  let loadingOverlayRef = useRef(null);

  return (
    <>
      <div className={style.main}>
        <a href="https://sstinc.org" rel="noreferrer noopener" target="_blank">
          <img
            src="/assets/sstinc-icon.png"
            alt="SST Inc Icon"
            width={100}
            height={100}
          />
        </a>
        {loginStatus === LoginStatus.Success ||
        loginStatus === LoginStatus.Fail ? (
          <>
            <div className={style.contentDiv}>
              <h3>
                {loginStatus === LoginStatus.Success ? "Success" : "Failed"}
              </h3>
              {loginStatus === LoginStatus.Success
                ? svgImages.checkmark
                : svgImages.cross}
              <p>You may leave the site now.</p>
            </div>
          </>
        ) : (
          <>
            <div className={style.contentDiv}>
              <h3>SST Inc Attendance Scanner</h3>
              <p>Kindy scan the given QR code below to check-in to SST Inc.</p>
              <QrReader
                delay={500}
                onError={(error: Error) => {
                  console.error(error);
                  if (error.name === "NotAllowedError")
                    return updateDebugMessage(
                      `Error: Camera Disabled`
                    );
                  else if (error.name === "NoVideoInputDevicesError")
                    return updateDebugMessage(
                      `Error: Camera Not Found (Use Safari if on iOS)`
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
                  backgroundColor:
                    debugMessage === `If you're reading this its too late...` ||
                    debugMessage === ``
                      ? "transparent"
                      : "#ff6c2d",
                }}
              >
                {debugMessage}
              </p>
              <div className={style.loadingOverlay} ref={loadingOverlayRef}>
                {svgImages.loading}
              </div>
            </div>
          </>
        )}

        <p className={style.about}>
          Created by{" "}
          <a className={style.link} href="https://ryanthe.com">
            Ryan The
          </a>{" "}
          from SST Inc | 2020 | v1.0
        </p>
      </div>
    </>
  );
}
