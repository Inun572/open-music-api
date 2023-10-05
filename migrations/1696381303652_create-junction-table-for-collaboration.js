exports.up = (pgm) => {
  pgm.createTable(
    'collaborations',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    }
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.playlist_id_and_playlist.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.user_id_and_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');

  pgm.dropConstraint(
    'collaborations',
    'fk_collaborations.playlist_id_and_playlist.id'
  );

  pgm.dropConstraint(
    'collaborations',
    'fk_collaborations.user_id_and_users.id'
  );
};
