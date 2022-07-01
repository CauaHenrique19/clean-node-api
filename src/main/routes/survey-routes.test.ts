import { Collection, ObjectId } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'
import { sign } from 'jsonwebtoken'
import env from '../config/env'


let surveyCollection: Collection
let accountCollection: Collection

describe('Surveys Routes', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })

    beforeEach(async () => {
        surveyCollection = await MongoHelper.getCollection('surveys')
        await surveyCollection.deleteMany({})

        accountCollection = await MongoHelper.getCollection('accounts')
        await accountCollection.deleteMany({})
    })

    afterAll(async () => {
        await MongoHelper.disconnect()
    })

    describe('POST /surveys', () => {
        test('Should return 403 on add survey without accessToken', async () => {
            await request(app)
                .post('/api/surveys')
                .send({
                    question: 'Question',
                    answers: [
                        { answer: 'Answer 1', image: 'http://image-name.com' },
                        { answer: 'Answer 2' }
                    ]
                })
                .expect(403)
        })

        test('Should return 204 on add survey with valid accessToken', async () => {
            const res = await accountCollection.insertOne({ name: 'caua', email: 'cauah6002@gmail.com', password: '123', role: 'admin' })
            const id = res.insertedId.toHexString()
            const accessToken = sign({ id }, env.jwtSecret)
            await accountCollection.updateOne({ _id: new ObjectId(id) }, { $set: { accessToken } })

            await request(app)
                .post('/api/surveys')
                .set('x-access-token', accessToken)
                .send({
                    question: 'Question',
                    answers: [
                        { answer: 'Answer 1', image: 'http://image-name.com' },
                        { answer: 'Answer 2' }
                    ]
                })
                .expect(204)
        })
    })
})