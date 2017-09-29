const { Command } = require('discord.js-commando');
const { Permissions } = require('discord.js');
const { CLIENT_ID } = process.env;

module.exports = class InviteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			aliases: ['invite'],
			group: 'mod',
			memberName: 'invite',
			description: 'Get link to invite Timothy to a server.',
			guarded: true
		});
	}

	hasPermission(msg) {
		return this.client.options.owner.indexOf(msg.author.id) !== -1;
	}

	run(msg) {
		if (msg.channel.type !== 'dm' && msg.channel.type !== 'group') {
			msg.delete();
		}

		return msg.direct(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot&permissions=${Permissions.ALL}`, {}); // eslint-disable-line max-len
	}
};
