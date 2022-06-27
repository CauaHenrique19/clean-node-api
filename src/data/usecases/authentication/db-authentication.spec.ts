import { AccountModel } from "../add-account/db-add-account-protocols"
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { DbAuthentication } from "./db-authentication"

describe('DbAuthentication UseCase', () => {
    test('Should call LoadAccountByEmail with correct email', async () => {
        class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
            async load(email: string): Promise<AccountModel> {
                const account : AccountModel = {
                    id: 'any_id',
                    email: 'any_mail',
                    name: 'any_name',
                    password: '123'
                }

                return new Promise(resolve => resolve(account))
            }
        }

        const loadAccountByEmailRepository = new LoadAccountByEmailRepositoryStub()
        const sut = new DbAuthentication(loadAccountByEmailRepository)
        const loadSpy = jest.spyOn(loadAccountByEmailRepository, 'load')
        await sut.auth({ email: 'any_email@mail.com', password: 'any_password' })

        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })
})