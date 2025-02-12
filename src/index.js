// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance with the required intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// Create a new Collection for commands
client.commands = new Collection();

// Path to your commands folder
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Load all command files from the commands folder
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Check if the command has both a data and an execute property
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.log(`Loaded command ${command.data.name}`);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {
	// Check if the interaction is a chat input command
	if (!interaction.isChatInputCommand()) return;
  
	console.log(`Interaction received: ${interaction.commandName}`);
  
	// Get the command from the Collection
	const command = client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
  
	try {
		// Execute the command
		await command.execute(interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}:`, error);
		// If the interaction was deferred or already replied, use editReply; otherwise, reply directly.
		if (interaction.deferred || interaction.replied) {
			await interaction.editReply({ content: 'There was an error executing this command.' });
		} else {
			await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
		}
	}
});