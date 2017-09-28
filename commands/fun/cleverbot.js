const { Command, FriendlyError } = require('discord.js-commando');
const request = require('request-promise');
const winston = require('winston');
const { CLEVERBOT_API } = process.env;

module.exports = class CleverbotCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cleverbot',
			aliases: [
				'bot',
				'timothy',
				'timmy',
				'talk'
			],
			group: 'fun',
			memberName: 'cleverbot',
			description: `Talk to me!`,
			args: [
				{
					key: 'text',
					prompt: 'What question would you like to say?',
					type: 'string'
				}
			]
		});
		
		// CS is how CleverBot keeps track of the coversation.
		this.cs = '';
	}

	async run(msg, args) {
		try {
			let query = `http://www.cleverbot.com/getreply?key=${CLEVERBOT_API}&input=${encodeURIComponent(args.text)}`;
			if (this.cs !== '') query += `&cs=${this.cs}`;

			const res = JSON.parse(await request.get(query));

			if (this.cs !== '') this.cs = res.cs;
			msg.say(res.output);
		} catch (err) {
			let errMsg = err;
			if (err.hasOwnProperty('error')) {
				const errInfo = JSON.parse(err.error);
				errMsg = `${errInfo.status}: ${errInfo.error}`;
			}

			winston.error(`[DISCORD]: CleverBotError:`, errMsg);
			throw new FriendlyError(err);
		}
	}
};
