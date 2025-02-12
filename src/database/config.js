const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './src/database/wrestlers.db',
    },
    useNullAsDefault: true
  });

module.exports = knex;