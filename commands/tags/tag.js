const { Command } = require('discord.js-commando');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag',
			group: 'tags',
			memberName: 'tag',
			description: 'Displays a tag.',
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what tag would you like to see?\n',
					type: 'string',
					parse: str => str.toLowerCase()
				}
			]
		});
	}

	async run(msg, args) {
		const tag = await TagRepo.get(args);
		return msg.reply(`\n${tag.content}`);
	}
};
