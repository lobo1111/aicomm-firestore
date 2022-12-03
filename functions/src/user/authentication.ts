import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

class Authentication {
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
