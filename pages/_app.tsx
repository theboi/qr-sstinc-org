import React, { useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import "./styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>SST Inc - Attendance Scanner</title>
      </Head>
      <Component {...pageProps} />
    </div>
  );
}
