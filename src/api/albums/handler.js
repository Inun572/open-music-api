const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._service.addAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil like album',
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { album, songs } = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.coverurl,
          songs,
        },
      },
    });
    response.code(200);
    return response;
  }

  async getAlbumLikeByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const result = await this._service.getAlbumLike(albumId);
    const { errorCode, value } = result;

    if (errorCode === 404) {
      const response = h.response({
        status: 'success',
        data: {
          likes: value,
        },
      });
      return response;
    }
    const response = h
      .response({
        status: 'success',
        data: {
          likes: value,
        },
      })
      .header('X-Data-Source', 'cache');
    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id: albumId } = request.params;
    await this._service.deleteAlbumById(albumId);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus like',
    });
    return response;
  }
}

module.exports = AlbumsHandler;
