import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import * as functions from "firebase-functions";
import { Authentication } from "./authentication";

class UserRegister {
  async parseRequest(request?: any): Promise<any> {
    functions.logger.log("Parsing payload: ", JSON.stringify(request));
    if (request.email !== undefined) {
      return request.email;
    } else {
      throw new Error("Invalid payload");
    }
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
      .getUserByEmail(email)
      .then((user) => {
        throw new Error("User already exists!");
      })
      .catch(() =>
        admin.auth().createUser({
          email: email,
          emailVerified: true,
          password: password,
          disabled: false,
        })
      )
      .then((user) => {
        return { user: user, password: password };
      });
  }
}

export { UserRegister };
