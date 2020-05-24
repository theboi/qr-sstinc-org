import React, { useState } from "react";
import dynamic from "next/dynamic";
import style from "./style.module.css";
import sha256 from "crypto-js/sha256";

export default function ScanPage() {
  const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

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
          if (result === hashed) {
            console.log("pass");
          }
        }}
        className={style.qr}
      />
    </div>
  );
}
