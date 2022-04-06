import { SignUpController } from "./signup"

describe('SignUp Controller', () => {
    test('Should Return 400 if no name is provided', () => {
        const sut = new SignUpController()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
    })
})