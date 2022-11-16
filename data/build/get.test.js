"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const uuid_1 = require("uuid");
const firebase = require("@firebase/rules-unit-testing");
const projectID = (0, uuid_1.v4)();
let testEnv;
beforeAll(async () => {
    testEnv = await firebase.initializeTestEnvironment({
        projectId: projectID,
        firestore: {
            rules: fs.readFileSync('./firestore.rules', 'utf8')
        }
    });
});
beforeEach(async () => {
    await testEnv.clearFirestore();
});
afterAll(async () => {
    await testEnv.cleanup();
});
describe('get user profile', () => {
    it('get user profile as HR department member', async () => {
        const uid = (0, uuid_1.v4)();
        const context = testEnv.authenticatedContext(uid, { claim: "HR" });
        const profile = {
            "email": "test@test.com",
            "manager": "other-manager@test.com",
            "department": "engineering"
        };
        const firestore = context.firestore();
        await firebase.assertSucceeds(firestore.doc("userProfile/" + uid).set(profile).then(_ => {
            firestore.doc("userProfile/test@test.com").get();
        }));
    });
    it('get user profile as profile owner', async () => {
        const uid = (0, uuid_1.v4)();
        const hr = testEnv.authenticatedContext(uid, { claim: "HR" });
        const regular = testEnv.authenticatedContext(uid, { email: "test@test.com" });
        const profile = {
            "email": "test@test.com",
            "manager": "other-manager@test.com",
            "department": "engineering"
        };
        const hrContext = hr.firestore();
        const regularContext = regular.firestore();
        await firebase.assertSucceeds(hrContext.doc("userProfile/" + uid).set(profile).then(_ => {
            regularContext.doc("userProfile/" + uid).get();
        }));
    });
    it('get other user profile as regular user', async () => {
        const hruid = (0, uuid_1.v4)();
        const regular = (0, uuid_1.v4)();
        const hr = testEnv.authenticatedContext(hruid, { claim: "HR" });
        const notowner = testEnv.authenticatedContext(regular, { email: "notowner@test.com" });
        const profile = {
            "email": "test@test.com",
            "manager": "other-manager@test.com",
            "department": "engineering"
        };
        const hrContext = hr.firestore();
        const notOwnerContext = notowner.firestore();
        await hrContext.doc("userProfile/" + hruid).set(profile);
        await firebase.assertFails(notOwnerContext.doc("userProfile/" + hruid).get());
    });
    it('get user profile as unauthenticated user', async () => {
        const uid = (0, uuid_1.v4)();
        const hr = testEnv.authenticatedContext(uid, { claim: "HR" });
        const context = testEnv.unauthenticatedContext();
        const profile = {
            "email": "test@test.com",
            "manager": "other-manager@test.com",
            "department": "engineering"
        };
        const hrContext = hr.firestore();
        const notOwnerContext = context.firestore();
        await hrContext.doc("userProfile/" + uid).set(profile);
        await firebase.assertFails(notOwnerContext.doc("userProfile/" + uid).get());
    });
});
//# sourceMappingURL=get.test.js.map