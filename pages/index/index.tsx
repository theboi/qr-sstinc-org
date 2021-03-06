import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

import style from "./style.module.css";
import svgStyle from "./svgImages.module.css";

import hash from "crypto-js/sha256";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

/** QrReader React component, dynamically imported with ssr: false from "react-qr-reader". */
const QrReader = dynamic(() => import("react-qr-reader"), {
  ssr: false,
});

/** @enum {number} Login states for authentication to Firebase and platform */
enum LoginStatus {
  None,
  Fail,
  Success,
}

/**
 * Returns truncated numbers to two digits.
 * @param {number} value A number to be truncated to two digits.
 * @returns {number} The truncated number.
 */
export const getTruncatedDate = (value: number): number =>
  parseInt(("0" + value.toString()).slice(-2));

/**
 * Returns key string to be hashed.
 * @param {string} nonce A nonce string (as used in cryptography).
 * @param {Date} date Date object to get numbers from.
 * @returns {string} The key from date.
 */
export const getKeyString = (nonce: string, date: Date): string => {
  return `${nonce}${getTruncatedDate(date.getDate())}${getTruncatedDate(
    date.getMonth() + 1
  )}${getTruncatedDate(date.getFullYear())}`;
};

/**
 * Provided by Firebase for API usage.
 */
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

/** Stores email of currently authenticated user after logging in */
let currentUserEmail = "";

export default function App() {
  const [debugMessage, updateDebugMessage] = useState(
    `If you're reading this its too late...`
  );
  const [loginStatus, updateLoginStatus] = useState(LoginStatus.None);
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  const auth = firebase.auth;
  const db = firebase.firestore;

  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    auth()
      .getRedirectResult()
      .then(function (result) {
        loadingOverlayRef.current.style.display = "none";
        setIsDoneLoading(true);

        let user = result.user;
        if (user.email.split("@")[1].split(".")[1] === "sst") {
          setTimeout(() => {
            window.location.href =
              "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
          }, 5000);
        }
        db().collection(`users`)
          .add({
            displayName: user.displayName,
            emailAddress: user.email,
            date: db.Timestamp.fromDate(new Date()),
          })
          .then((docRef) => {
            currentUserEmail = user.email;
            updateLoginStatus(LoginStatus.Success);
            console.log(`Successful document written with ID: ${docRef.id}`);
          })
          .catch((error) => {
            updateLoginStatus(LoginStatus.Fail);
            console.error(`Error adding document: ${error}`);
          });
      })
      .catch(function (error) {
        console.warn(`${error.message} (Please log in)`);
      });
  });

  let loadingOverlayRef = useRef(null);

  const handleScan = (result: string) => {
    const hashed = hash(getKeyString("sstinc", new Date())).toString();
    if (result === hashed) {
      console.log("pass");
      var provider = new auth.GoogleAuthProvider();
      auth().signInWithRedirect(provider);
    }
  };

  const handleError = (error: Error) => {
    console.error(error);
    if (error.name === "NotAllowedError")
      return updateDebugMessage(`Error: Camera Disabled`);
    else if (error.name === "NoVideoInputDevicesError")
      return updateDebugMessage(
        `Error: Camera Not Found (Use Safari if on iOS)`
      );
    updateDebugMessage(`Error: ${error.name}`);
  };

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
              {currentUserEmail}
              <p>
                {loginStatus === LoginStatus.Success
                  ? "You may leave the site now."
                  : "Inform a SST Inc. EXCO and try again."}
              </p>
              {loginStatus === LoginStatus.Success
                ? svgImages.checkMark
                : svgImages.cross}
            </div>
          </>
        ) : (
          <>
            <div className={style.contentDiv}>
              <h3>SST Inc Attendance Scanner</h3>
              <p>Kindly scan the QR code provided to check-in to SST Inc.</p>
              {isDoneLoading ? (
                <QrReader
                  delay={1000}
                  onError={handleError}
                  onScan={handleScan}
                  className={style.qr}
                />
              ) : (
                <></>
              )}
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
        <div className={style.credits}>
          <p>
            Made with ♥&#xFE0E; by{" "}
            <a
              href="https://www.ryanthe.com"
              target="_blank"
              className={style.link}
            >
              Ryan The
            </a>{" "}
            from SST Inc, 2020, v1.2.
          </p>
          <p>
            Open sourced on{" "}
            <a
              href="https://github.com/theboi/qr-sstinc-org"
              target="_blank"
              className={style.link}
            >
              GitHub
            </a>
            .{" "}
          </p>
        </div>
      </div>
    </>
  );
}

/** Object containing inline SVG images in JSX */
const svgImages = {
  checkMark: (
    <svg
      className={svgStyle.image}
      style={{ boxShadow: "inset 0px 0px 0px 30px var(--fillGreen)" }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle
        className={svgStyle.circle}
        style={{ stroke: "var(--borderGreen)" }}
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <path
        className={svgStyle.symbol}
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  ),
  cross: (
    <svg
      className={svgStyle.image}
      style={{ boxShadow: "inset 0px 0px 0px 30px var(--fillRed)" }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle
        className={svgStyle.circle}
        style={{ stroke: "var(--borderRed)" }}
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <line className={svgStyle.symbol} x1="35" y1="16" x2="16" y2="35"></line>
      <line className={svgStyle.symbol} x1="16" y1="16" x2="35" y2="35"></line>
    </svg>
  ),
  loading: (
    <svg
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
  ),
};
