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

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambah playlist baru');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username
      FROM users u
      JOIN playlists p ON u.id = p.owner
      JOIN collaborations c ON p.id = c.playlist_id
      WHERE p.owner = $1 OR c.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    console.log(result.rows);
    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        'Gagal menghapus playlist, playlist tidak ditemukan'
      );
    }

    return result.rows[0].id;
  }

  // validasi playlist
  async checkPlaylist(id) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }
  }

  // validasi song
  async checkSong(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan.');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongInPlaylist(playlistId) {
    await this.checkPlaylist(playlistId);

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

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus lagu dari playlist');
    }
    return result.rows[0];
  }
}

module.exports = PlaylistsService;
