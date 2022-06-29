import { DbAuthentication } from "../../../data/usecases/authentication/db-authentication"
import { BcrypAdapter } from "../../../infra/criptography/bcrypt-adapter/bcrypt-adapter"
import { JwtAdapter } from "../../../infra/criptography/jwt-adapter/jwt-adapter"
import { AccountMongoRepository } from "../../../infra/db/mongodb/account/account-mongo-repository"
import { LogMongoRepository } from "../../../infra/db/mongodb/log/log-mongo-repository"
import { LoginController } from "../../../presentation/controllers/login/login-controller"
import { Controller } from "../../../presentation/protocols"
import { LogControllerDecorator } from "../../decorators/log-controller-decorator"
import { makeLoginValidation } from "./login-validation.factory"
import env from '../../config/env'

export const makeLoginController = (): Controller => {
    const SALT = 12
    const accountMongoRepository = new AccountMongoRepository()
    const bcryptAdapter = new BcrypAdapter(SALT)
    const jwtAdapter = new JwtAdapter(env.jwtSecret)
    const validation = new DbAuthentication(accountMongoRepository, bcryptAdapter, jwtAdapter, accountMongoRepository)
    const loginController = new LoginController(makeLoginValidation(), validation)
    const logMongoRepository = new LogMongoRepository()

    return new LogControllerDecorator(loginController, logMongoRepository)
}