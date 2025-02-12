# WWE Bot

**WWE Bot** is a Discord bot that provides information about WWE superstars. Currently, the bot has two main commands:

- **/wrestler-info**: Displays detailed information about a WWE superstar based on the provided name.
- **/random-wrestler**: Returns information about a randomly selected WWE superstar from the database.

## Features

- **Search for Wrestlers:** Use the `/wrestler-info` command to search for a wrestler and get details such as name, description, image, and a Wikipedia link.
- **Random Wrestler:** Retrieve information about a randomly selected wrestler using the `/random-wrestler` command.
- **Local Database:** Wrestler data is stored in an SQLite database and accessed using Knex.
- **Discord Integration:** Built with [Discord.js](https://discord.js.org/), the bot uses slash commands for easy interaction.

## Prerequisites

- **Node.js:** Version 14 or higher.
- **npm or yarn:** To install dependencies.
- **Discord Account:** To create and add the bot to a server.
- **Bot Token:** Obtain it from the [Discord Developer Portal](https://discord.com/developers/applications).
