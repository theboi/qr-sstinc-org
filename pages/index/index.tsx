import React, { useState } from "react";
import dynamic from "next/dynamic";
import style from "./style.module.css";
import sha256 from "crypto-js/sha256";

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";

// import QrReader from "react-qr-reader"
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function App() {
  
  return (
    <div className={style.main}>
      <h1 className={style.header}>Attendance Scanner</h1>
      <QrReader
        delay={500}
        onError={() => {
          console.log("error");
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
    </div>
  );
}
