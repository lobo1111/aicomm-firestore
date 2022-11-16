import * as fs from 'fs'
import { v4 } from "uuid"
import * as firebase from '@firebase/rules-unit-testing'

const projectID = v4()
let testEnv: firebase.RulesTestEnvironment

beforeAll(async () => {
  testEnv = await firebase.initializeTestEnvironment({
    projectId: projectID,
    firestore: {
      rules: fs.readFileSync('./firestore.rules', 'utf8')
    }
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('get user profile', () => {
  it('get user profile as HR department member', async () => {
    const uid = v4()
    const context = testEnv.authenticatedContext(uid, {claim: "HR"})
    const profile = {
      "email": "test@test.com",
      "manager": "other-manager@test.com",
      "department": "engineering"
    }
    const firestore = context.firestore()
    await firebase.assertSucceeds(
      firestore.doc("profiles/" + uid).set(profile).then(_ => {
        firestore.doc("profiles/test@test.com").get()
      })
    )
  })

  it('get user profile as profile owner', async () => {
    const uid = v4()
    const hr = testEnv.authenticatedContext(uid, {claim: "HR"})
    const regular = testEnv.authenticatedContext(uid, {email: "test@test.com"})
    const profile = {
      "email": "test@test.com",
      "manager": "other-manager@test.com",
      "department": "engineering"
    }
    const hrContext = hr.firestore()
    const regularContext = regular.firestore()
    await firebase.assertSucceeds(
      hrContext.doc("profiles/" + uid).set(profile).then(_ => {
        regularContext.doc("profiles/" + uid).get()
      })
    )
  })
 
  it('get other user profile as regular user', async () => {
    const hruid = v4()
    const regular = v4()
    const hr = testEnv.authenticatedContext(hruid, {claim: "HR"})
    const notowner = testEnv.authenticatedContext(regular, {email: "notowner@test.com"})
    const profile = {
      "email": "test@test.com",
      "manager": "other-manager@test.com",
      "department": "engineering"
    }
    const hrContext = hr.firestore()
    const notOwnerContext = notowner.firestore()
    await hrContext.doc("profiles/" + hruid).set(profile)
    await firebase.assertFails(
      notOwnerContext.doc("profiles/" + hruid).get()
    )
  })

  it('get user profile as unauthenticated user', async () => {
    const uid = v4()
    const hr = testEnv.authenticatedContext(uid, {claim: "HR"})
    const context = testEnv.unauthenticatedContext()
    const profile = {
      "email": "test@test.com",
      "manager": "other-manager@test.com",
      "department": "engineering"
    }
    const hrContext = hr.firestore()
    const notOwnerContext = context.firestore()
    await hrContext.doc("profiles/" + uid).set(profile)
    await firebase.assertFails(
      notOwnerContext.doc("profiles/" + uid).get()
    )
  })
})