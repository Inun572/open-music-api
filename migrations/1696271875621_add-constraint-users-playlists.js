/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlists',
    'fk_playlist.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlist.owner_users.id');
};
