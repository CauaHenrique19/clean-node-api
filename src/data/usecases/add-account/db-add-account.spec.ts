import { AccountModel, AddAccountModel, Hasher, AddAccountRepository } from "./db-add-account-protocols";
import { DbAddAccount } from "./db-add-account"

const makeHasher = (): Hasher => {
    class HasherStub implements Hasher {
        async hash(value: string): Promise<string> {
            return new Promise((resolve, reject) => resolve('hashed_password'))
        }
    }

    return new HasherStub()
}

const makeFakeAccount = (): AccountModel => ({
    id: 'any_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'hashed_password'
})

const makeFakeAccountData = (): AddAccountModel => ({
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_password'
})

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        async add(accountData: AddAccountModel): Promise<AccountModel> {
            return new Promise((resolve, reject) => resolve(makeFakeAccount()))
        }
    }

    return new AddAccountRepositoryStub()
}

export interface SutTypes {
    sut: DbAddAccount,
    hasherStub: Hasher,
    addAccountRepositoryStub: AddAccountRepository
}

const makeSut = (): SutTypes => {
    const hasherStub = makeHasher()
    const addAccountRepositoryStub = makeAddAccountRepository()
    const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub)

    return {
        sut,
        hasherStub,
        addAccountRepositoryStub
    }
}

describe('DbAddAccount UseCase', () => {
    test('Should Call Hasher with correct password', () => {
        const { sut, hasherStub } = makeSut()

        const hashSpy = jest.spyOn(hasherStub, 'hash')

        sut.add(makeFakeAccountData())
        expect(hashSpy).toHaveBeenCalledWith('valid_password')
    })

    test('Should throw if Hasher throws', async () => {
        const { sut, hasherStub } = makeSut()
        jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        )

        const promise = sut.add(makeFakeAccountData())
        await expect(promise).rejects.toThrow()
    })

    test('Should Call AddAccountRepository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut()

        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

        await sut.add(makeFakeAccountData())
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email@mail.com',
            password: 'hashed_password'
        })
    })

    test('Should throw if AddAccountRepository throws', async () => {
        const { sut, addAccountRepositoryStub } = makeSut()
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        )

        const promise = sut.add(makeFakeAccountData())
        await expect(promise).rejects.toThrow()
    })

    test('Should return and account if on success', async () => {
        const { sut } = makeSut()

        const account = await sut.add(makeFakeAccountData())
        expect(account).toEqual(makeFakeAccount())
    })
})