import { cert, initializeApp } from "firebase-admin";
import fs from "fs";
// import serviceAccount from "../serviceAccountKey.json"  with {type:"json"};

const serviceAccount = JSON.parse(
  fs.readFileSync("/etc/secrets/serviceAccountKey.json", "utf8")
);

export const app=initializeApp({
  credential: cert(serviceAccount)
});