const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const ForbiddenError = require('../exceptions/ForbiddenError');

class PlaylistsService {
  constructor(collabService) {
    this._pool = new Pool();
    this._collabService = collabService;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const playlist = result.rows[0];

    if (!playlist) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (playlist.owner !== owner) {
      throw new ForbiddenError('Akses dilarang');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collabService.verifyCollaborations(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambah playlist baru');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username
      FROM users u
      FULL JOIN playlists p ON u.id = p.owner
      FULL JOIN collaborations c ON p.id = c.playlist_id
      WHERE p.owner = $1 OR c.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal menghapus playlist, playlist tidak ditemukan'
      );
    }

    return result.rows[0].id;
  }

  // validasi song
  async checkSong(id) {
    console.log(typeof id);
    if (typeof id !== 'string') {
      throw new InvariantError('Input tidak valid');
    }

    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan.');
    }
  }

  async addSongToPlaylist(playlistId, songId, credentialId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    // log activities
    const activitiesId = `log-${nanoid(16)}`;
    const action = 'add';
    const time = new Date().toISOString();
    const logQuery = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [activitiesId, playlistId, songId, credentialId, action, time],
    };

    const logResult = await this._pool.query(logQuery);
    if (!logResult.rowCount) {
      console.log('gagal menyimpan log playlists');
    }

    return result.rows[0].id;
  }

  async getSongInPlaylist(playlistId) {
    const playlistQuery = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p JOIN users u ON p.owner = u.id WHERE p.id = $1',
      values: [playlistId],
    };

    const songQuery = {
      text: 'SELECT s.id, s.title, s.performer FROM playlists p LEFT JOIN playlists_songs ps ON p.id = ps.playlist_id RIGHT JOIN songs s ON ps.song_id = s.id WHERE P.id = $1;',
      values: [playlistId],
    };

    const playlist = await this._pool.query(playlistQuery);

    const songs = await this._pool.query(songQuery);

    if (!playlist.rows.length) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    if (!songs.rows.length) {
      throw new InvariantError('Belum ada lagu di Playlist');
    }

    return {
      playlist: playlist.rows[0],
      songs: songs.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, credentialId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus lagu dari playlist');
    }

    // log activities
    const activitiesId = `log-${nanoid(16)}`;
    const action = 'delete';
    const time = new Date().toISOString();
    const logQuery = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [activitiesId, playlistId, songId, credentialId, action, time],
    };

    const logResult = await this._pool.query(logQuery);
    if (!logResult.rowCount) {
      console.log('gagal menyimpan log playlists');
    }

    return result.rows[0];
  }

  // playlist_activities Service
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, pa.action, pa.time, pa.song_id
      FROM playlist_activities pa
      JOIN users u ON pa.user_id = u.id
      JOIN songs s ON pa.song_id = s.id
      WHERE pa.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal mendapatkan playlist activities');
    }

    return result.rows;
  }
}

module.exports = PlaylistsService;
