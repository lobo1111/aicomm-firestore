import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import * as functions from "firebase-functions";
import { Authentication } from "./authentication";

class UserRegister {
  async extractEmail(request?: any): Promise<any> {
    functions.logger.log("Parsing payload: ", JSON.stringify(request));
    if (request.email !== undefined) {
      return request.email;
    } else {
      throw new Error("Invalid payload");
    }
  }

  async extractUserData(params?: any, request?: any): Promise<any> {
    functions.logger.log("Parsing payload: ", JSON.stringify(request));
    if (params.uid !== undefined) {
      return {
        uid: params.uid,
        status: request.status,
        claims: request.claims,
      };
    } else {
      throw new Error("Invalid payload");
    }
  }

  async updateUser(userData: { uid: string; status: boolean }) {
    return admin.auth().updateUser(userData.uid, {
      disabled: !userData.status,
    });
  }

  async registerUser({
    email,
  }: {
    email: any;
  }): Promise<{ user: void | UserRecord; password: string }> {
    functions.logger.log("Creating user: ", email);
    let password = new Authentication().generatePassword();
    return admin
      .auth()
      .createUser({
        email: email,
        emailVerified: true,
        password: password,
        disabled: false,
      }) //this will drop an error if users exists, will be catched later
      .then((user) => {
        return { user: user, password: password };
      });
  }
}

export { UserRegister };
