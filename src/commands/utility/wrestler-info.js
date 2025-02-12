const { formatDate } = require('../../utils/date-utils');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const knex = require('../../database/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wrestler-info')
    .setDescription('Get info about a WWE superstar')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Wrestler name')
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log('wrestler-info command invoked!');
    try {
      console.log('Received interaction:', interaction.id);
      await interaction.deferReply();
      console.log('Reply deferred successfully.');

      const query = interaction.options.getString('name');
      console.log(`Searching for wrestler matching: ${query}`);

      const wrestler = await knex('wrestlers')
        .whereRaw('LOWER(name) LIKE ?', [`%${query.toLowerCase()}%`])
        .first();
      console.log('Database query complete.');

      if (!wrestler) {
        console.log('No wrestler found.');
        return interaction.editReply({
          content: `No wrestler found for "${query}" 🤼`
        });
      }

      let description = wrestler.description || 'No description available';
      if (description.length > 1024) {
        description = description.substring(0, 1021) + '...';
        console.log('Description truncated.');
      }

      const embed = new EmbedBuilder()
        .setTitle(wrestler.name)
        .setColor('#FF0000')
        .setThumbnail(wrestler.image_url)
        .addFields(
          { name: 'Description', value: description },
          { name: 'Wikipedia', value: `[View Page](${wrestler.wiki_url})` }
        )
        .setFooter({ text: `ID: ${wrestler.id} | Added ${formatDate(wrestler.created_at)}` });

      console.log('Sending reply embed.');
      await interaction.editReply({ embeds: [embed] });
      console.log('Reply sent successfully.');

    } catch (error) {
      console.error('Command Error:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: 'Error fetching wrestler info ⚠️'
        });
      } else {
        await interaction.reply({
          content: 'Error fetching wrestler info ⚠️',
          ephemeral: true
        });
      }
    }
  }
};

