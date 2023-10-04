const Joi = require('joi');

const CollabPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollabPayloadSchema };
