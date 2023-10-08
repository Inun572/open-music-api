const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album Gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addAlbumLike(albumId, userId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Album sudah dilike');
    } else {
      const id = `like-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Gagal menambahkan like');
      }

      await this._cacheService.delete(`album:${albumId}`);
      return result.rows[0];
    }
  }

  async getAlbumById(id) {
    const query1 = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const query2 = {
      text: 'SELECT id, title, performer FROM songs WHERE albumid = $1',
      values: [id],
    };

    const albumQuery = await this._pool.query(query1);
    const songQuery = await this._pool.query(query2);

    if (!albumQuery.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumQuery.rows[0];
    const songs = songQuery.rows;

    return {
      album,
      songs,
    };
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);
      return {
        errorCode: 200,
        value: parseInt(JSON.parse(result)),
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const errorCode = error.statusCode;
      const value = parseInt(result.rows[0].count);

      if (!result.rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
      await this._cacheService.set(
        `album:${albumId}`,
        JSON.stringify(result.rows[0].count)
      );
      return {
        errorCode,
        value,
      };
    }
  }

  async editAlbumById(albumId, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $2, year = $3 WHERE id = $1 RETURNING id',
      values: [albumId, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan, gagal mengupdate album');
    }

    return result.rows[0];
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE from albums WHERE id = $1 RETURNING id',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan, gagal menghapus album');
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus like');
    }

    await this._cacheService.delete(`album:${albumId}`);
  }
}

module.exports = AlbumsService;
