import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

class Authentication {
  createDefaultClaims({ email }: { email?: string } = {}): { hr: boolean } {
    const claims = {
      hr: false,
    };
    if (email?.endsWith("kopacki.eu")) {
      //A hack until I figure out test data import
      functions.logger.info("Privileged user detected!");
      claims.hr = true;
    }
    return claims;
  }

  async setClaims(uid: string, claims: any): Promise<void> {
    return admin.auth().setCustomUserClaims(uid, claims);
  }

  async disable(uid: string, active: boolean) {
    return admin.auth().updateUser(uid, {
      disabled: !active,
    });
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async isTokenValid(token: string) {
    functions.logger.log("Token validation: ", token);
    return admin
      .auth()
      .verifyIdToken(token)
      .catch((error) => {
        throw new Error("Invalid token");
      });
  }

  async isHR(token: string) {
    functions.logger.log("HR access verification...");
    return this.isTokenValid(token).then((decodedToken) => {
      functions.logger.log("Decoded user from the token: ", decodedToken.email);
      if (decodedToken.hr !== true) {
        throw new Error("HR claim missing");
      }
    });
  }
}

export { Authentication };
