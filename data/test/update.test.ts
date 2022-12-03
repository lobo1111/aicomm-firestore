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

describe('update user profile', () => {
  it('update user profile as HR department member', async () => {
    const uid = v4()
    const hr = testEnv.authenticatedContext(uid, {claim: "HR"})
    const profile = {
        "email": "test@test.com",
        "manager": "other-manager@test.com",
        "department": "engineering",
        "uid": uid,
    }
    const hrContext = hr.firestore()
     await firebase.assertSucceeds(
      hrContext.doc("persons/" + uid).set(profile).then(_ => {
        hrContext.doc("persons/" + uid).update(profile)
      })
    ) 
  })
})