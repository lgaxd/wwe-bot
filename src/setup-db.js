const knex = require('./database/config')

async function createTable() {
  try {
    await knex.schema.createTable('wrestlers', (table) => {
      table.increments('id');
      table.string('name').notNullable().unique();
      table.string('description');
      table.string('image_url');
      table.string('wiki_url');
      table.timestamps(true, true);
    });
    console.log('Table created!');
  } catch (error) {
    console.error(error);
  } finally {
    await knex.destroy();
  }
}

createTable();