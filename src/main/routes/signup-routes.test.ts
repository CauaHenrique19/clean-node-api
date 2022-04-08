import request from 'supertest'
import app from '../config/app'

describe('SignUp Routes', () => {
    test('Should return an account os success', async () => {
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