import admin from "firebase-admin";



if (!admin.apps.length) {
  const svc = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  app = admin.initializeApp({
    credential: admin.credential.cert(svc),
  });
} else {
  app = admin.app();
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, app, db, auth };
