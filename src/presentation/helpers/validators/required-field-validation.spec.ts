import { MissingParamError } from "../../errors"
import { RequiredFieldValidation } from "./required-field-validation"

describe('RequiredField Validation', () => {
    test('Should return a MissingParamError if validation fails', () => {
        const sut = new RequiredFieldValidation('field')
        const error = sut.validate({ name: 'any_value' })
        expect(error).toEqual(new MissingParamError('field'))
    })

    test('Should not return a if validation succeeds', () => {
        const sut = new RequiredFieldValidation('field')
        const error = sut.validate({ field: 'any_value' })
        expect(error).toBeFalsy()
    })
})