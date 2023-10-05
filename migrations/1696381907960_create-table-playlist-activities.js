exports.up = (pgm) => {
  pgm.createTable(
    'playlist_activities',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      song_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      action: {
        type: 'TEXT',
        notNull: true,
      },
      time: {
        type: 'TEXT',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    }
  );

  pgm.addConstraint(
    'playlist_activities',
    'fk_playlist_activties.playlist_id_and_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_activities');

  pgm.dropConstraint(
    'playlist_activities',
    'fk_playlist_activties.playlist_id_and_playlists.id'
  );
};
