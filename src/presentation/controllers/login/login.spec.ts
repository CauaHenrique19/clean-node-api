import { MissingParamError } from "../../errors"
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http/http-helper"
import { HttpRequest, Authentication } from "./login-protocols"
import { LoginController } from "./login"
import { Validation } from "../signup/signup-protocols"

const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
        validate(input: any): Error {
            return null
        }
    }

    return new ValidationStub()
}

const makeAuthentication = () => {
    class AuthenticationStub implements Authentication {
        async auth(email: string, password: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }

    return new AuthenticationStub()
}

export interface sutTypes {
    sut: LoginController
    authenticationStub: Authentication,
    validationStub: Validation
}

const makeSut = (): sutTypes => {
    const authenticationStub = makeAuthentication()
    const validationStub = makeValidation()
    const sut = new LoginController(validationStub, authenticationStub)

    return {
        sut,
        authenticationStub,
        validationStub
    }
}

const makeFakeRequest = (): HttpRequest => ({
    body: {
        email: 'any_email@email.com',
        password: 'any_password'
    }
})

describe('Login Controller', () => {
    test('Should call authentication with correct values', async () => {
        const { sut, authenticationStub } = makeSut()
        const authSpy = jest.spyOn(authenticationStub, 'auth')

        await sut.handle(makeFakeRequest())
        expect(authSpy).toHaveBeenCalledWith('any_email@email.com', 'any_password')
    })

    test('Should return 401 if invalid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut()
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)))

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(unauthorized())
    })

    test('Should return 500 if authentication throws', async () => {
        const { sut, authenticationStub } = makeSut()
        jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(() => {
            throw new Error()
        })

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(serverError(new Error()))
    })

    test('Should return 200 if valid credentials are provided', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }))
    })

    test('Should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut()
        const validateSpy = jest.spyOn(validationStub, 'validate')
        const httpRequest = makeFakeRequest()
        await sut.handle(httpRequest)
        expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
    })

    test('Should Return 400 if Validation returns an error', async () => {
        const { sut, validationStub } = makeSut()
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
        const httpRequest = makeFakeRequest()
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
    })
})