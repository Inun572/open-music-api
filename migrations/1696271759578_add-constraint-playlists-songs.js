/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlists_songs',
    'fk_playlists_songs.playlist_id_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'playlists_songs',
    'fk_playlists_songs.song_id_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlists_songs',
    'fk_playlists_songs.playlist_id_playlists.id'
  );
  pgm.dropConstraint('playlists_songs', 'fk_playlists_songs.song_id_songs.id');
};
