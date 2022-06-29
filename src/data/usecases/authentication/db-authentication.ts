import { Authentication, AuthenticationModel } from "../../../domain/usecases/authentication";
import { HashComparer } from "../../protocols/criptography/hash-comparer";
import { TokenGenerator } from "../../protocols/criptography/token-generator";
import { LoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";
import { UpdateAcessTokenRepository } from "../../protocols/db/update-acess-token-repository";

export class DbAuthentication implements Authentication{
    constructor(
        private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
        private readonly hashComparer: HashComparer,
        private readonly tokenGenerator: TokenGenerator,
        private readonly updateAccessTokenRepository: UpdateAcessTokenRepository
    ){}

    async auth(authentication: AuthenticationModel): Promise<string>{
        const account = await this.loadAccountByEmailRepository.load(authentication.email)

        if(account){
            const isValid = await this.hashComparer.compare(authentication.password, account.password)

            if(isValid){
                const acessToken = await this.tokenGenerator.generate(account.id)
                await this.updateAccessTokenRepository.update(account.id, acessToken)
                return acessToken
            }
        }

        return null
    }
}