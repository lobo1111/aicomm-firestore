import * as functions from "firebase-functions";
import { NewUsers } from "./user/new-users";
import * as admin from "firebase-admin";
import * as express from "express";
import { Authentication } from "./user/authentication";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
const app = express();
app.use(express.json());

admin.initializeApp();

exports.userCreated = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Creating new user record", user);
  return new NewUsers()
    .createProfile({ uid: user.uid, email: user.email })
    .then((_) => {
      functions.logger.info("Done");
    });
});

exports.setClaims = functions.firestore
  .document("/users/{documentId}")
  .onUpdate((snap, context) => {
    new NewUsers().setClaims({ userRecord: snap.after.data() });
    functions.logger.info("Custom claims for user set", snap.after.data());
    return null;
  });

app.post("/createUser", (request: any, response: any) => {
  const token = request.headers.authorization?.split("Bearer ")[1];
  new Authentication()
    .isHR(token)
    .then(() => {
      return new NewUsers().parseRequest(request.body);
    })
    .then((email: string) => {
      return new NewUsers().createUser({ email });
    })
    .then((userRecord: { user: void | UserRecord; password: string }) => {
      response.status(200).send({
        uid: userRecord.user?.uid,
        password: userRecord.password,
        persons: "/persons/" + userRecord.user?.uid,
        users: "/users/" + userRecord.user?.uid,
      });
    })
    .catch((error) => {
      functions.logger.log("Error: ", error);
      response.status(404).send({
        uid: "n/a",
        password: "n/a",
        persons: "n/a",
        users: "n/a",
      });
    });
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
