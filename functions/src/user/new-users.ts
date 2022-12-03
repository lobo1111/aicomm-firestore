import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import * as functions from "firebase-functions";

class NewUsers {
  createDefaultClaims({ email }: { email?: string } = {}): { hr: boolean } {
    const claims = {
      hr: false,
    };
    if (email?.endsWith("kopacki.eu")) {
      functions.logger.info("Privileged user detected!");
      claims.hr = true;
    }
    return claims;
  }

  async parseRequest(request?: any): Promise<any> {
    functions.logger.log("Parsing payload: ", JSON.stringify(request));
    if (request.email !== undefined) {
      return request.email;
    } else {
      throw new Error("Invalid payload");
    }
  }

  async createProfile({
    uid,
    email,
  }: {
    uid: string;
    email?: string;
  }): Promise<void> {
    const docRef = admin.firestore().collection("persons").doc(uid);
    const claims = this.createDefaultClaims({ email });
    return docRef
      .set({
        uid: uid,
      })
      .then((_) => {
        return admin.firestore().collection("users").doc(uid).set({
          uid: uid,
          email: email,
          display_name: email,
          user_name: email,
          person: docRef,
          claims: claims,
        });
      })
      .then((_) => {
        return this.setClaims({ userRecord: { uid: uid, claims: claims } });
      });
  }

  async setClaims({ userRecord }: { userRecord: any }): Promise<void> {
    functions.logger.log("Custom claims request: ", JSON.stringify(userRecord));
    return admin.auth().setCustomUserClaims(userRecord.uid, userRecord.claims);
  }

  async createUser({
    email,
  }: {
    email: any;
  }): Promise<{ user: void | UserRecord; password: string }> {
    functions.logger.log("Creating user: ", email);
    let password = this.generatePassword();
    return admin
      .auth()
      .getUserByEmail(email)
      .then((user) => {
        if (user !== null) {
          throw new Error("User already exists!");
        }
      })
      .catch(() => {
        return admin.auth().createUser({
          email: email,
          emailVerified: true,
          password: password,
          disabled: false,
        });
      })
      .then((user) => {
        return { user: user, password: password };
      });
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}

export { NewUsers };
