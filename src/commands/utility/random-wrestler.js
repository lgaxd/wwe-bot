const { formatDate } = require('../../utils/date-utils');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const knex = require('../../database/config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random-wrestler')
		.setDescription('Show a random WWE superstar'),
	async execute(interaction) {

		const wrestler = await knex('wrestlers')
			.whereRaw('id IN (SELECT id FROM wrestlers ORDER BY RANDOM() LIMIT 1)')
			.first();
		console.log('Database query complete.');

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
			.setFooter({ text: `ID: ${wrestler.id} | Added ${formatDate(wrestler.created_at)}` });;

		await interaction.reply({ embeds: [embed] });
	}
};