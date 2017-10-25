const { Command } = require('discord.js-commando');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'add-tag',
			aliases: ['tag-add'],
			group: 'tags',
			memberName: 'add',
			description: 'Adds a tag.',
			details: `Adds a tag, usable for everyone. (Markdown can be used.)`,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what would you like to name it?\n',
					type: 'string'
				},
				{
					key: 'content',
					label: 'tagcontent',
					prompt: 'what content would you like to add?\n',
					type: 'string',
					max: 1800
				}
			]
		});
	}

	run(msg, args) {
		return TagRepo.add(msg, args);
	}
};
