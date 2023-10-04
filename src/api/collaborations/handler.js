const { server } = require('@hapi/hapi');
const autoBind = require('auto-bind');

class CollabHandler {
  constructor(playlistsService, service, validator) {
    this._playlistsService = playlistsService;
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollabPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.checkPlaylist(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.checkUserExist(userId);

    const collabId = await this._service.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId: collabId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollabPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.checkPlaylist(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.checkUserExist(userId);

    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: `Berhasil menghapus kolaborasi user ${userId} pada playlist ${playlistId}`,
    };
  }
}

module.exports = CollabHandler;
