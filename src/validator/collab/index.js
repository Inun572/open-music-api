const InvariantError = require('../../exceptions/InvariantError');
const { CollabPayloadSchema } = require('./schema');

const CollabValidator = {
  validateCollabPayload: (payload) => {
    const validationResult = CollabPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollabValidator;
