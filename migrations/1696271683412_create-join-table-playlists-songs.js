exports.up = (pgm) => {
  pgm.createTable(
    'playlists_songs',
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
    },
    {
      ifNotExists: true,
    }
  );
};

exports.down = (pgm) => {};
