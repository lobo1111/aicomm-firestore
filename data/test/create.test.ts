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

describe('create user profile', () => {
    it('create user profile as HR department member', async () => {
    const uid = v4()
    const context = testEnv.authenticatedContext(uid, {claim: "HR"})
    const profile = {
        "email": "test@test.com",
        "manager": "manager@test.com",
        "department": "engineering"
    }
    await firebase.assertSucceeds(
      context.firestore().doc("profiles/" + uid).set(profile)
    )
  })

  it('create user profile as non HR department member', async () => {
    const uid = v4()
    const context = testEnv.authenticatedContext(uid)
    const profile = {
        "email": "test@test.com",
        "manager": "manager@test.com",
        "department": "engineering"
    }
    await firebase.assertFails(
      context.firestore().doc("profiles/" + uid).set(profile)
    )
  })

  it('create user profile as unauthenticated user', async () => {
    const uid = v4()
    const context = testEnv.unauthenticatedContext()
    const profile = {
        "email": "test@test.com",
        "manager": "manager@test.com",
        "department": "engineering"
    }
    await firebase.assertFails(
      context.firestore().doc("profiles/" + uid).set(profile)
    )
  }) 
})