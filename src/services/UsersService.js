const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async checkUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows[0] > 0) {
      throw new InvariantError(
        'Gagal membuat user baru, username telah digunakan.'
      );
    }
  }

  async addUser(username, password, fullname) {
    // validasi username
    await this.checkUsername(username);

    // klo oke, simpan ke database
    const userId = `user-${nanoid(16)}`;
    const saltRounds = 20;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING userid',
      values: [userId, username, hashPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal membuat user baru');
    }

    return result.rows[0].id;
  }
}

module.exports = UsersService;
