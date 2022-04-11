import { DbAddAccount } from '../../data/usecases/add-account/db-add-account'
import { BcrypAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { LogMongoRepository } from '../../infra/db/mongodb/log-repository/log'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { Controller } from '../../presentation/protocols'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'
import { LogControllerDecorator } from '../decorators/log'
import { makeSignUpValidation } from './signup-validation'

export const makeSignUpController = (): Controller => {
    const SALT = 12
    const addAccountMongoRepository = new AccountMongoRepository()
    const encrypter = new BcrypAdapter(SALT)
    const addAccount = new DbAddAccount(encrypter, addAccountMongoRepository)
    const emailValidator = new EmailValidatorAdapter()
    const signUpController = new SignUpController(emailValidator, addAccount, makeSignUpValidation())
    const logMongoRepository = new LogMongoRepository()
    return new LogControllerDecorator(signUpController, logMongoRepository)
}