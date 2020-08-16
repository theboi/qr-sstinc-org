export default (req, res) => {
  res.statusCode = 200;

  const admin = require("firebase-admin");

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
          "Timestamp (SGT)": data.date
            .toDate()
            .toLocaleString("en-SG", { timeZone: "Asia/Singapore" }),
          Email: data.emailAddress,
          Name: data.displayName,
        };
      });
      res.json(output);
    })
    .catch((e: Error) => {
      console.error("ERROR", e);
    });
};
