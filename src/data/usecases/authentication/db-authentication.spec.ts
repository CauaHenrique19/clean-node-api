import { AccountModel } from "../add-account/db-add-account-protocols"
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { DbAuthentication } from "./db-authentication"
import { AuthenticationModel } from "../../../domain/usecases/authentication"

const makeFakeAccount = () : AccountModel => ({
    id: 'any_id',
    email: 'any_mail',
    name: 'any_name',
    password: '123'
})

const makeFakeAuthentication = () : AuthenticationModel => ({ email: 'any_email@mail.com', password: 'any_password' })

const makeLoadAccountByEmailRepository = () : LoadAccountByEmailRepository => {
    class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
        async load(email: string): Promise<AccountModel> {
            const account = makeFakeAccount()
            return new Promise(resolve => resolve(account))
        }
    }
    
    return new LoadAccountByEmailRepositoryStub()
}

interface SutTypes{
    sut: DbAuthentication
    loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeSut = () : SutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub)

    return {
        sut,
        loadAccountByEmailRepositoryStub
    }
}

describe('DbAuthentication UseCase', () => {
    test('Should call LoadAccountByEmail with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
        await sut.auth(makeFakeAuthentication())

        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })
})