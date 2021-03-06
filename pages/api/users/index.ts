/**
 * API Endpoint for spreadsheet to receive authenticated users.
 */
import { NextApiResponse, NextApiRequest } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const admin = require("firebase-admin");

  /**
   * Provided by Firebase for using Firebase APIs. To be passed as argument when initializing app.
   */
  const serviceAccount = {
    type: "service_account",
    project_id: "qr-sstinc-org",
    private_key_id: "38367dbeb6166ae7ec8cea36c82478333e0ff95a",
    private_key: process.env.GCP_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n"),
    client_email: "qr-sstinc-org@qr-sstinc-org.iam.gserviceaccount.com",
    client_id: "110160196758503350057",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/qr-sstinc-org%40qr-sstinc-org.iam.gserviceaccount.com",
  };

  if (!admin.apps.length)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  admin
    .firestore()
    .collection("users")
    .orderBy("date", "desc")
    .get()
    .then((col) => {
      const output = col.docs.map((value) => {
        let data = value.data();
        return {
          /**
           * Forces data.date to SGT time format. If excluded, time will
           * be shown in UTC during production.
           */
          "Timestamp (SGT)": data.date
            .toDate()
            .toLocaleString("en-SG", { timeZone: "Asia/Singapore" }),
          Email: data.emailAddress,
          Name: data.displayName,
        };
      });
      res.status(200).json(output);
    })
    .catch((e: Error) => {
      res.status(404).send("Not found")
      console.error("ERROR: ", e);
    });
};
