import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

exports.userCreated = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Creating new user record", user);
  return admin.firestore().collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    claims: {},
  }).then((_) => {
    functions.logger.info("Creating new profile record");
    return admin.firestore().collection("profiles").doc(user.uid).set({
      uid: user.uid,
      first_name: "not-set",
      last_name: "not-set",
    });
  }).then((_) => {
    functions.logger.info("Done");
  });
});

exports.setClaims = functions.firestore.document("/users/{documentId}")
    .onUpdate((snap, context) => {
      const userRecord = snap.after.data();
      admin.auth().setCustomUserClaims(userRecord.uid, userRecord.claims);
      functions.logger.info("Custom claims for user set", userRecord);
      return null;
    });
