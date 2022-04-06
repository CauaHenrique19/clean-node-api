import { SignUpController } from "./signup"
import { InvalidParamError, MissingParamError, ServerError } from "../../errors";
import { AccountModel, AddAccount, AddAccountModel, EmailValidator } from "./signup-protocols";

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add(account: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = {
                id: 1,
                name: 'valid_name',
                email: 'valid_email@email.com',
                password: 'valid_password'
            }

            return new Promise((resolve) => resolve(fakeAccount))
        }
    }

    return new AddAccountStub()
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }

    return new EmailValidatorStub()
}

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator,
    addAccountStub: AddAccount
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator()
    const addAccountStub = makeAddAccount()
    const sut = new SignUpController(emailValidatorStub, addAccountStub)

    return {
        sut,
        emailValidatorStub,
        addAccountStub
    }
}

describe('SignUp Controller', () => {
    test('Should Return 400 if no name is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    })

    test('Should Return 400 if no email is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should Return 400 if no password is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should Return 400 if no password confirmation is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
    })

    test('Should Return 400 if password confirmation fails', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: 'invalid_password'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
    })

    test('Should Return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

        const httpRequest = {
            body: {
                email: 'invalid_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })

    test('Should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    test('Should Return 500 if EmailValidator throws', async () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => {
            throw new Error()
        })

        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should Return 500 if AddAccount throws', async () => {
        const { sut, addAccountStub } = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementation(async () => {
            return new Promise((resolve, reject) => reject(new Error()))
        })

        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')

        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                name: 'any_name',
                password: '123',
                passwordConfirmation: '123'
            }
        }

        await sut.handle(httpRequest)
        expect(addSpy).toHaveBeenCalledWith({
            email: 'any_email@mail.com',
            name: 'any_name',
            password: '123'
        })
    })

    test('Should Return 200 if valid data is provided', async () => {
        const { sut } = makeSut()

        const httpRequest = {
            body: {
                name: 'valid_name',
                email: 'valid_email@email.com',
                password: 'valid_password',
                passwordConfirmation: 'valid_password'
            }
        }

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body).toEqual({
            id: 1,
            name: 'valid_name',
            email: 'valid_email@email.com',
            password: 'valid_password'
        })
    })
})