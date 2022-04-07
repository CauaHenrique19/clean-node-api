import bcrypt from 'bcrypt'
import { BcrypAdapter } from './bcrypt-adapter'

describe('Bcrypt Adapter', () => {
    test('Should call bcrypt with correct values', async () => {
        const salt = 12
        const sut = new BcrypAdapter(salt)
        const hashSpy = jest.spyOn(bcrypt, 'hash')
        await sut.encrypt('any_value')

        expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
    })
})