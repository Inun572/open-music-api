const autoBind = require('auto-bind');

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
    const playlistId = await this._service.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist baru berhasil ditambahkan',
      data: {
        playlistId,
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

  async deletePlaylistHandler(request) {
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
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.checkSong(songId);

    await this._service.addSongToPlaylist(playlistId, songId, credentialId);

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

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const result = await this._service.getSongInPlaylist(playlistId);

    if (result.playlist.length > 0) {
      const response = h.response({
        status: 'success',
        data: {
          result,
        },
      });
      return response;
    }

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

  async deleteSongFromPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(
      playlistId,
      songId,
      credentialId
    );

    return {
      status: 'success',
      message: `Berhasil menghapus lagu ${songId} dari playlist ${playlistId}`,
    };
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const log = await this._service.getPlaylistActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities: log,
      },
    });
    return response;
  }
}

module.exports = PlaylistsHandler;
