const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const Tag = require('../../models/Tag');
const TagRepo = require('../../structures/repos/TagRepo');

module.exports = class TagListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag-list',
			aliases: ['tags', 'list-tag', 'list-tags', 'tags-list'],
			group: 'tags',
			memberName: 'list',
			description: 'Lists all tags.',
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'category',
					label: 'tagcategory',
					prompt: 'List the tags from what category?\n',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		const tags = await this.getAll(args);

		if (!tags) {
			return msg.reply(
				args.category
					? `${args.category} doesn't have any tags. Why not add one?`
					: `There are no tags. Why not add one?`
			);
		}

		return this.displayTags(msg, tags);
	}

	async getAll(args) {
		args = TagRepo.sanitizeArgs(args);
		const { category } = args;

		const where = { category };
		if (!category) {
			where.name = { $ne: null }; // WHERE name NOT NULL
		}

		let tags = await Tag.findAll({ where });
		tags = tags.filter(tag => tag.name);
		return tags;
	}

	displayTags(msg, tags) {
		const otherTags = tags.filter(tag => tag.userID !== msg.author.id)
			.map(tag => tag.name)
			.sort()
			.join(', ');

		const userTags = tags.filter(tag => tag.userID === msg.author.id)
			.map(tag => tag.name)
			.sort()
			.join(', ');
		
		return msg.reply(stripIndents`\u2063\n
			**❯ Tags:**
			${otherTags ? otherTags : 'None.'}

			**❯ ${msg.member.displayName}'s tags:**
			${userTags ? ` ${userTags}` : `${msg.member.displayName} has no tags.`}
		`);
	}
};
