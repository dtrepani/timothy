const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			group: 'fun',
			memberName: 'say',
			description: 'Speak through Timothy.',
			details: `Careful what you say. Some people can look at who is making Timothy say what. ;)`,
			args: [
				{
					key: 'text',
					prompt: 'What would you like me to say?',
					type: 'string'
				}
			]
		});
	}

	run(msg, args) {
		msg.deleteMsg();
		return msg.say(args.text);
	}
};
