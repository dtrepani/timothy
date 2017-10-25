const { Command } = require('discord.js-commando');

const Tag = require('../../models/Tag');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagSourceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag-source',
			aliases: ['source-tag', 'src-tag', 'tag-src'],
			group: 'tags',
			memberName: 'source',
			description: 'Displays a tags source.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what tag source would you like to see?\n',
					type: 'string',
					parse: str => str.toLowerCase()
				},
				{
					key: 'category',
					label: 'tagcategory',
					prompt: 'grab tag source from what category?\n',
					type: 'string',
					default: ''
				},
				{
					key: 'subcategory',
					label: 'tagsubcategory',
					prompt: 'from what subcategory?\n',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		const tag = await TagRepo.get(args);
		return msg.replyCode(tag.content);
	}
};
