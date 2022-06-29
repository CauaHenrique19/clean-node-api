import { AddAccountRepository } from "../../../../data/protocols/db/account/add-account-repository";
import { LoadAccountByEmailRepository } from "../../../../data/protocols/db/account/load-account-by-email-repository";
import { UpdateAcessTokenRepository } from "../../../../data/protocols/db/account/update-acess-token-repository";
import { AccountModel } from "../../../../domain/models/account";
import { AddAccountModel } from "../../../../domain/usecases/add-account";
import { MongoHelper } from '../helpers/mongo-helper';
import { ObjectId } from 'mongodb'

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository, UpdateAcessTokenRepository {
    async add(accountData: AddAccountModel): Promise<AccountModel> {
        const accountCollection = await MongoHelper.getCollection('accounts')
        const result = await accountCollection.insertOne(accountData)
        const account = await accountCollection.findOne(result.insertedId)

        return MongoHelper.map(account)
    }

    async loadByEmail(email: string): Promise<AccountModel> {
        const accountCollection = await MongoHelper.getCollection('accounts')
        const account = await accountCollection.findOne({ email })

        return account && MongoHelper.map(account)
    }

    async updateAccessToken(id: string, token: string): Promise<void> {
        const objectId = new ObjectId(id)
        const accountCollection = await MongoHelper.getCollection('accounts')
        await accountCollection.updateOne(
            { _id: objectId }, 
            { $set : { accessToken: token } }
        )
    }
}