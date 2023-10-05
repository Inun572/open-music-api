exports.up = (pgm) => {
  pgm.createTable(
    'auth',
    {
      token: {
        type: 'TEXT',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable('auth');
};
