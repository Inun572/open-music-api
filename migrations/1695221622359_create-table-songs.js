exports.up = (pgm) => {
  pgm.createTable(
    'songs',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      title: {
        type: 'TEXT',
        notNull: true,
      },
      year: {
        type: 'INT',
        notNull: true,
      },
      performer: {
        type: 'TEXT',
        notNull: true,
      },
      genre: {
        type: 'TEXT',
        notNull: true,
      },
      duration: {
        type: 'INT',
        notNull: false,
      },
      albumid: {
        type: 'VARCHAR(50)',
        notNull: false,
      },
    },
    {
      ifNotExists: true,
    }
  );

  pgm.addConstraint(
    'songs',
    'fk_songs.albumid_and_albums.id',
    'FOREIGN KEY(albumid) REFERENCES albums(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');

  pgm.dropConstraint('songs', 'fk_songs.album_id_and_albums.id');
};
