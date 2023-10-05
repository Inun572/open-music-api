const {
  PostAuthPayloadSchema,
  PutAuthPayloadSchema,
  DeleteAuthPayloadSchema
} = require('./schema')

const InvariantError = require('../../exceptions/InvariantError')

const AuthValidator = {
  validatePostAuthPayload: (payload) => {
    const validationResult = PostAuthPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePutAuthPayload: (payload) => {
    const validationResult = PutAuthPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateDeleteAuthPayload: (payload) => {
    const validationResult = DeleteAuthPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AuthValidator
