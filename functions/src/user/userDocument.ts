import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Authentication } from "./authentication";

class UserDocument {
  async createUserRecord(profile: any) {
    functions.logger.log("Creating user record for profile: ", profile);
    admin
      .firestore()
      .collection("users")
      .doc(profile?.uid)
      .set({
        uid: profile?.uid,
        email: profile.get("email"),
        claims: new Authentication().createDefaultClaims(profile?.email),
        profile: profile.ref,
        active: true,
      });
  }

  async getProfileDoc(email?: string) {
    return admin
      .firestore()
      .collection("persons")
      .where("email", "==", email)
      .get()
      .then((query) => {
        if (query.docs.length != 1) {
          throw new Error(
            "Multiple or zero profiles found with the same email"
          );
        }
        return query.docs[0];
      });
  }

  async updateProfileDoc(profileDoc: any, uid: string) {
    return admin
      .firestore()
      .collection("persons")
      .doc(profileDoc.id)
      .update({ uid: uid })
      .then(() => {
        profileDoc.uid = uid; //required because it operates on the query result, not the update from above!
        return profileDoc;
      });
  }
}

export { UserDocument };
