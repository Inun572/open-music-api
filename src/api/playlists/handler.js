const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlist_id = await this._service.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist baru berhasil ditambahkan',
      data: {
        playlistId: playlist_id,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylist(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const { songId } = request.payload;
    await this._service.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: `Lagu ${songId} berhasil ditambahkan ke playlist ${playlistId}`,
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const result = await this._service.getSongInPlaylist(playlistId);

    const { playlist, songs } = result;

    const response = h.response({
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    });
    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const { songId } = request.payload;
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: `Berhasil menghapus lagu ${songId} dari playlist ${playlistId}`,
    };
  }
}

module.exports = PlaylistsHandler;
