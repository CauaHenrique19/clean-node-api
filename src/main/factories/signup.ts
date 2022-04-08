import { DbAddAccount } from '../../data/usecases/add-account/db-add-account'
import { BcrypAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'

const makeSignUpController = (): SignUpController => {
    const SALT = 12
    const addAccountMongoRepository = new AccountMongoRepository()
    const encrypter = new BcrypAdapter(SALT)
    const addAccount = new DbAddAccount(encrypter, addAccountMongoRepository)
    const emailValidator = new EmailValidatorAdapter()
    return new SignUpController(emailValidator, addAccount)
}