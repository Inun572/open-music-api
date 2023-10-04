/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlists_songs',
    'unique_playlist_id_and_song_id',
    'UNIQUE(playlist_id, song_id)'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('unique_playlist_id_and_song_id');
};
