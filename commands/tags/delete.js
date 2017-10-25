const { Command } = require('discord.js-commando');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagDeleteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'delete-tag',
			aliases: [
				'tag-delete',
				'tag-del',
				'del-tag'
			],
			group: 'tags',
			memberName: 'delete',
			description: 'Deletes a tag.',
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what tag would you like to delete?\n',
					type: 'string',
					parse: str => str.toLowerCase()
				},
				{
					key: 'category',
					label: 'tagcategory',
					prompt: 'delete the tag from what category?\n',
					type: 'string',
					default: '',
					parse: str => str.toLowerCase()
				}
			]
		});
	}

	run(msg, args) {
		return TagRepo.delete(msg, args);
	}
};
