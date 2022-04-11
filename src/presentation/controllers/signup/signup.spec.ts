import { SignUpController } from "./signup"
import { MissingParamError, ServerError } from "../../errors";
import { AccountModel, AddAccount, AddAccountModel, HttpRequest, Validation } from "./signup-protocols";
import { badRequest, ok, serverError } from "../../helpers/http/http-helper";

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add(account: AddAccountModel): Promise<AccountModel> {
            return new Promise((resolve) => resolve(makeFakeAccount()))
        }
    }

    return new AddAccountStub()
}

const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
        validate(input: any): Error {
            return null
        }
    }

    return new ValidationStub()
}

const makeFakeRequest = (): HttpRequest => ({
    body: {
        email: 'any_email@mail.com',
        name: 'any_name',
        password: '123',
        passwordConfirmation: '123'
    }
})

const makeFakeAccount = (): AccountModel => ({
    id: 'any_id',
    name: 'valid_name',
    email: 'valid_email@email.com',
    password: 'valid_password'
})

interface SutTypes {
    sut: SignUpController,
    addAccountStub: AddAccount,
    validationStub: Validation
}

const makeSut = (): SutTypes => {
    const addAccountStub = makeAddAccount()
    const validationStub = makeValidation()
    const sut = new SignUpController(addAccountStub, validationStub)

    return {
        sut,
        addAccountStub,
        validationStub
    }
}

describe('SignUp Controller', () => {
    test('Should Return 500 if AddAccount throws', async () => {
        const { sut, addAccountStub } = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementation(async () => {
            return new Promise((resolve, reject) => reject(new Error()))
        })

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(serverError(new ServerError(null)))
    })

    test('Should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')

        await sut.handle(makeFakeRequest())
        expect(addSpy).toHaveBeenCalledWith({
            email: 'any_email@mail.com',
            name: 'any_name',
            password: '123'
        })
    })

    test('Should Return 200 if valid data is provided', async () => {
        const { sut } = makeSut()

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(ok(makeFakeAccount()))
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