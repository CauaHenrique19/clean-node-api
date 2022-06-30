import { Decrypter } from '../../protocols/criptography/decrypter'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'
import { LoadAccountByTokenRepository } from '../../protocols/db/account/load-account-by-email-token'

interface SutTypes{
    sut: DbLoadAccountByToken
    decrypterStub: Decrypter
    loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
}

const makeFakeAccount = (): AccountModel => ({
    id: 'any_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'hashed_password'
})

const makeDecrypterStub = () : Decrypter => {
    class DecrypterStub implements Decrypter{
        async decrypt(value: string): Promise<string> {
            return new Promise(resolve => resolve('any_value'))
        }
    }

    return new DecrypterStub()
}

const makeLoadAccountByTokenRepositoryStub = () : LoadAccountByTokenRepository => {
    class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository{
        async loadByToken(token: string, role?: string): Promise<AccountModel> {
            return new Promise(resolve => resolve(makeFakeAccount()))
        }
    }

    return new LoadAccountByTokenRepositoryStub()
}

const makeSut = () : SutTypes => {
    const decrypterStub = makeDecrypterStub()
    const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepositoryStub()
    const sut = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepositoryStub)

    return {
        sut,
        decrypterStub,
        loadAccountByTokenRepositoryStub
    }
}

describe('DbLoadAccountByToken UseCase', () => {
    test('Should call Decrypter with correct values', async () => {
        const { sut, decrypterStub } = makeSut()
        const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
        await sut.load('any_token', 'any_role')
        expect(decryptSpy).toHaveBeenCalledWith('any_token')
    })

    test('Should return null Decrypter returns null', async () => {
        const { sut, decrypterStub } = makeSut()
        jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise(resolve => resolve(null)))

        const account = await sut.load('any_token', 'any_role')
        expect(account).toBeNull()
    })

    
    test('Should call LoadAccountByTokenRepository with correct values', async () => {
        const { sut, loadAccountByTokenRepositoryStub } = makeSut()
        const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
        await sut.load('any_token', 'any_role')
        expect(loadByTokenSpy).toHaveBeenCalledWith('any_token', 'any_role')
    })
})