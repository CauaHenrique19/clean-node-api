import { DbAuthentication } from "./db-authentication"
import { 
    AccountModel, 
    LoadAccountByEmailRepository, 
    AuthenticationModel, 
    HashComparer, 
    TokenGenerator, 
    UpdateAcessTokenRepository 
} from "./db-authentication-protocols"

const makeFakeAccount = () : AccountModel => ({
    id: 'any_id',
    email: 'any_mail',
    name: 'any_name',
    password: 'hashed_password'
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

const makeHashComaparer = () : HashComparer => {
    class HashComparerStub implements HashComparer {
        async compare(value: string, hash: string): Promise<boolean> {
            return new Promise(resolve => resolve(true))
        }
    }
    
    return new HashComparerStub()
}


const makeTokenGenerator = () : TokenGenerator => {
    class TokenGeneratorStub implements TokenGenerator {
        async generate(id: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    
    return new TokenGeneratorStub()
}

const makeUpdateAcessTokenRepository = () : UpdateAcessTokenRepository => {
    class UpdateAcessTokenRepositoryStub implements UpdateAcessTokenRepository {
        async update(id: string, token: string): Promise<void> {
            return new Promise(resolve => resolve())
        }
    }
    
    return new UpdateAcessTokenRepositoryStub()
}

interface SutTypes{
    sut: DbAuthentication
    loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository,
    hashComparerStub: HashComparer,
    tokenGeneratorStub: TokenGenerator,
    updateAccessTokenRepository: UpdateAcessTokenRepository
}

const makeSut = () : SutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
    const hashComparerStub = makeHashComaparer()
    const tokenGeneratorStub = makeTokenGenerator()
    const updateAccessTokenRepository = makeUpdateAcessTokenRepository()
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub, 
        hashComparerStub, 
        tokenGeneratorStub,
        updateAccessTokenRepository
    )

    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        tokenGeneratorStub,
        updateAccessTokenRepository
    }
}

describe('DbAuthentication UseCase', () => {
    test('Should call LoadAccountByEmail with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
        await sut.auth(makeFakeAuthentication())

        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })
    
    test('Should throw if LoadAccountByEmail throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const promise = sut.auth(makeFakeAuthentication())
        
        await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadAccountByEmail returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null)
        const accessToken = await sut.auth(makeFakeAuthentication())

        expect(accessToken).toBeNull()
    })

    test('Should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut()
        const compareSpy = jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(null)
        await sut.auth(makeFakeAuthentication())

        expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
    })

    test('Should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const promise = sut.auth(makeFakeAuthentication())
        
        await expect(promise).rejects.toThrow()
    })

    test('Should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(new Promise(resolve => resolve(false)))
        const accessToken = await sut.auth(makeFakeAuthentication())

        expect(accessToken).toBeNull()
    })

    test('Should call TokenGenerator with correct id', async () => {
        const { sut, tokenGeneratorStub } = makeSut()
        const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate').mockReturnValueOnce(null)
        await sut.auth(makeFakeAuthentication())

        expect(generateSpy).toHaveBeenCalledWith('any_id')
    })

    test('Should throw if TokenGenerator throws', async () => {
        const { sut, tokenGeneratorStub } = makeSut()
        jest.spyOn(tokenGeneratorStub, 'generate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const promise = sut.auth(makeFakeAuthentication())
        
        await expect(promise).rejects.toThrow()
    })

    test('Should call TokenGenerator with correct id', async () => {
        const { sut } = makeSut()
        const accessToken = await sut.auth(makeFakeAuthentication())

        expect(accessToken).toBe('any_token')
    })

    test('Should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepository } = makeSut()
        const updateSpy = jest.spyOn(updateAccessTokenRepository, 'update')
        const accessToken = await sut.auth(makeFakeAuthentication())

        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
    })

    test('Should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepository } = makeSut()
        jest.spyOn(updateAccessTokenRepository, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const promise = sut.auth(makeFakeAuthentication())
        
        await expect(promise).rejects.toThrow()
    })
})