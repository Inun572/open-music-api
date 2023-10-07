const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
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

    if (!albumQuery.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumQuery.rows[0];
    const songs = songQuery.rows;

    return {
      album,
      songs,
    };
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
}

module.exports = AlbumsService;
