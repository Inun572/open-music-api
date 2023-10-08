/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable(
    'user_album_likes',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      album_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    }
  );

  pgm.addConstraint(
    'user_album_likes',
    'FK_user_album_likes.user_id_and_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
  pgm.addConstraint(
    'user_album_likes',
    'FK_user_album_likes.album_id_and_albums.id',
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');

  pgm.dropConstraint(
    'user_album_likes',
    'FK_user_album_likes.user_id_and_users.id'
  );

  pgm.dropConstraint(
    'user_album_likes',
    'FK_user_album_likes.album_id_and_albums.id'
  );
};
