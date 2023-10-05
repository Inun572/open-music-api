const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');

class CollabService {
  constructor() {
    this._pool = new Pool();
  }

  async checkUserExist(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User ID tidak ditemukan');
    }
  }

  async verifyCollaborations(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambah kolaborasi baru');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        `Gagal menghapus kolaborasi ${userId} pada playlist ${playlistId}`
      );
    }
  }
}

module.exports = CollabService;
