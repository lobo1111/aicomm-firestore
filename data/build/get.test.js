"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const uuid_1 = require("uuid");
const firebase = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, serverTimestamp, setLogLevel, } = require("firebase/firestore");
const projectID = (0, uuid_1.v4)();
let testEnv;
beforeAll(async () => {
    testEnv = await firebase.initializeTestEnvironment({
        projectId: projectID,
        firestore: {
            rules: fs.readFileSync("./firestore.rules", "utf8"),
        },
    });
});
beforeEach(async () => {
    await testEnv.clearFirestore();
});
afterAll(async () => {
    await testEnv.cleanup();
});
describe("get user profile", () => {
    it("get user profile as HR department member", async () => {
        const uid = (0, uuid_1.v4)();
        const context = testEnv.authenticatedContext(uid, { claim: "HR" });
        const profile = {
            email: "test@test.com",
            manager: "other-manager@test.com",
            department: "engineering",
            uid: uid,
        };
        const firestore = context.firestore();
        await firebase.assertSucceeds(firestore
            .collection("persons")
            .add(profile)
            .then((profile) => {
            firestore
                .collection(profile.path.split("/")[0])
                .doc(profile.path.split("/")[1])
                .get();
        }));
    });
    it("get user profile as profile owner", async () => {
        const reguid = (0, uuid_1.v4)();
        const regular = testEnv.authenticatedContext(reguid, {
            email: "test@test.com",
        });
        const profile = {
            email: "test@test.com",
            manager: "other-manager@test.com",
            department: "engineering",
            uid: reguid,
        };
        const regularContext = regular.firestore();
        let docRef;
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await context.firestore().collection("persons").doc(reguid).set(profile);
        });
        firebase.assertSucceeds(doc(regularContext, "persons", reguid));
    });
    it("get other user profile as regular user", async () => {
        const hruid = (0, uuid_1.v4)();
        const regular = (0, uuid_1.v4)();
        const hr = testEnv.authenticatedContext(hruid, { claim: "HR" });
        const notowner = testEnv.authenticatedContext(regular, {
            email: "notowner@test.com",
        });
        const profile = {
            email: "test@test.com",
            manager: "other-manager@test.com",
            department: "engineering",
            uid: hruid,
        };
        const hrContext = hr.firestore();
        const notOwnerContext = notowner.firestore();
        await hrContext.doc("persons/" + hruid).set(profile);
        await firebase.assertFails(notOwnerContext.collection("persons").doc(hruid).get());
    });
    it("get user profile as unauthenticated user", async () => {
        const uid = (0, uuid_1.v4)();
        const hr = testEnv.authenticatedContext(uid, { claim: "HR" });
        const context = testEnv.unauthenticatedContext();
        const profile = {
            email: "test@test.com",
            manager: "other-manager@test.com",
            department: "engineering",
            uid: uid,
        };
        const hrContext = hr.firestore();
        const notOwnerContext = context.firestore();
        await hrContext.doc("persons/" + uid).set(profile);
        await firebase.assertFails(notOwnerContext.doc("persons/" + uid).get());
    });
});
//# sourceMappingURL=get.test.js.map