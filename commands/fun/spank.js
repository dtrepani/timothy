const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

module.exports = class SpankCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'spank',
			group: 'fun',
			memberName: 'spank',
			description: `;)`,
			examples: ['spank @Kyuu#9384'],
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 60
			},
			args: [
				{
					key: 'member',
					prompt: 'Spank which user?',
					type: 'member'
				}
			]
		});
	}

	run(msg, args) {
		return msg.reply(
			stripIndents`${args.member}, bend over bitch and accept your punishment from ${msg.member}!
				http://i.imgur.com/Sqw0WvF.gif`
		);
	}
};
