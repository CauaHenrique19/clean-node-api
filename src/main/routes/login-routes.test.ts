import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'
import { hash } from 'bcrypt'

let accountCollection: Collection

describe('Login Routes', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })

    beforeEach(async () => {
        accountCollection = await MongoHelper.getCollection('accounts')
        await accountCollection.deleteMany({})
    })

    afterAll(async () => {
        await MongoHelper.disconnect()
    })

    describe('POST /signup', () => {
        test('Should return 200 on signup', async () => {
            await request(app)
                .post('/api/signup')
                .send({
                    name: 'caua',
                    email: 'cauah6002@gmail.com',
                    password: '123',
                    passwordConfirmation: '123'
                })
                .expect(200)
        })
    })

    describe('POST /signup', () => {
        test('Should return 200 on login', async () => {
            const SALT = 12
            const password = await hash('123', SALT)
            await accountCollection.insertOne({ name: 'caua', email: 'cauah6002@gmail.com', password })

            await request(app)
                .post('/api/login')
                .send({
                    email: 'cauah6002@gmail.com',
                    password: '123',
                })
                .expect(200)
        })

        test('Should return 401 on login', async () => {
            await request(app)
                .post('/api/login')
                .send({
                    email: 'cauah6002@gmail.com',
                    password: '123',
                })
                .expect(401)
        })
    })
})