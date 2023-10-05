const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu Gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query(
      'SELECT id, title, performer FROM songs'
    );

    if (!result.rowCount) {
      throw new NotFoundError('Belum ada data lagu');
    }
    return result.rows;
  }

  async getSongsWithParameter(title, performer) {
    const q1 = `${title}%`;
    const q2 = `${performer}%`;

    const query1 = {
      text: 'SELECT id, title, performer FROM songs WHERE lower(title) like $1 OR lower(performer) like $2',
      values: [q1, q2],
    };
    const query2 = {
      text: 'SELECT id, title, performer FROM songs WHERE lower(title) like $1 AND lower(performer) like $2',
      values: [q1, q2],
    };

    const result =
      title && performer
        ? await this._pool.query(query2)
        : await this._pool.query(query1);

    if (!result.rowCount) {
      throw new NotFoundError('Belum ada data lagu');
    }
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumid }) {
    const query = {
      text: 'UPDATE songs SET title = $2, year = $3, performer = $4, genre = $5, duration = $6, albumId = $7 WHERE id = $1 RETURNING id',
      values: [id, title, year, performer, genre, duration, albumid],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan, gagal menmgupdate lagu');
    }

    return result.rows[0];
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan, gagal menghapus lagu');
    }
    return result.rows[0].id;
  }
}

module.exports = SongsService;
