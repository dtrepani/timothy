const { Command } = require('discord.js-commando');
const moment = require('moment');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagWhoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag-info',
			aliases: ['info-tag', 'tag-who', 'who-tag'],
			group: 'tags',
			memberName: 'info',
			description: 'Displays information about a tag.',
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what tag would you like to have information on?\n',
					type: 'string',
					parse: str => str.toLowerCase()
				},
				{
					key: 'category',
					label: 'tagcategory',
					prompt: 'from what category?\n',
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

		return msg.replyEmbed({
			title: tag.name || tag.getFullCategory(),
			color: 3447003,
			fields: [
				{
					name: '❯ Username',
					value: `${tag.userName} (ID: ${tag.userID})`
				},
				{
					name: '❯ Server',
					value: `${tag.guildName}`,
					inline: true
				},
				{
					name: '❯ Category',
					value: `${tag.getFullCategory() || 'None'}`,
					inline: true
				},
				{
					name: '❯ Uses',
					value: `${tag.uses}`,
					inline: true
				},
				{
					name: '❯ Created',
					value: `${moment.utc(tag.createdAt).format('dddd, MMMM Do YYYY, hh:mm:ss A ZZ')}`
				}
			]
		});
	}
};
