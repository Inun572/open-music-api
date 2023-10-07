exports.up = (pgm) => {
  pgm.addColumns(
    'albums',
    {
      coverurl: {
        type: 'TEXT',
        default: null,
      },
    },
    {
      ifNotExists: true,
    }
  );
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'coverurl');
};
