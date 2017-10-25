const { FriendlyError } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const Tag = require('../../models/Tag');

module.exports = class TagRepo {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * @typedef {Object} TagArgs
	 * @property {?string} name - Name of tag
	 * @property {string} content - Content of tag, max of 1800 characters
	 * @property {?string} category - Category of tag
	 * @property {?string} subcategory - Subcategory of tag
	 */

	/**
	 * Empty streams should be treated like nulls
	 * @param {TagArgs} args
	 * @return {TagArgs}
	 */
	static sanitizeArgs(args) {
		const { name, category, subcategory } = args; // eslint-disable-line no-unused-vars
		const sanitizedArgs = { content: args.content };
		sanitizedArgs.name = !name ? null : name.toLowerCase();
		sanitizedArgs.category = !category ? null : category.toLowerCase();
		sanitizedArgs.subcategory = !subcategory ? null : subcategory.toLowerCase();
		return sanitizedArgs;
	}

	/**
	 * @return {string} String concantenated with subcategory, if it exists
	 */
	static getFullCategory(category, subcategory) {
		return `${category}${subcategory ? `/${subcategory}` : ''}`;
	}

	/**
	 * Get a tag
	 * @param {TagArgs} args
	 * @return {Tag}
	 */
	static async get(args) {
		const { name, category, subcategory } = this.sanitizeArgs(args);
		const tag = await Tag.findOne({ where: { name, category, subcategory } });
		if (!tag) {
			throw new FriendlyError(`No such tag matching that criteria exists.`);
		}

		tag.increment('uses');
		return tag;
	}

	/**
	 * Get all tags in category
	 * @param {TagArgs} args
	 * @return {Tag[]}
	 */
	static async getAll(args) {
		const { category, subcategory } = this.sanitizeArgs(args);
		const where = { category };
		if (subcategory) {
			where.subcategory = subcategory;
		}
		
		const tags = await Tag.findAll({ where });
		return tags ? [] : tags;
	}

	/**
	 * Get a random tag from a category
	 * @param {CommandMessage} msg
	 * @param {TagArgs} args
	 * @return {Promise<Message|Message[]>}
	 */
	static async getRandom(msg, args) {
		const { category, subcategory } = this.sanitizeArgs(args);
		const where = { category };
		if (subcategory) {
			where.subcategory = subcategory;
		}

		const tags = await this.getAll({ where });

		if (!tags.length) {
			return msg.reply(`${this.getFullCategory(category, subcategory)} has no tags. Why not add some?`);
		}

		const tag = tags[Math.floor(Math.random() * tags.length)];
		tag.increment('uses');
		return msg.reply(tag.content);
	}
	
	/**
	 * Add a tag
	 * @param {CommandMessage} msg
	 * @param {TagArgs} args
	 * @return {Promise<Message|Message[]>}
	 */
	static async add(msg, args) {
		const { name, content, category, subcategory } = this.sanitizeArgs(args);

		/**
		 * @property {Array<*, boolean>} - The tag itself and whether or not the tag was created (vs. already existing)
		 */
		const tag = await Tag.findOrCreate({
			where: {
				userID: msg.author.id,
				userName: `${msg.author.tag}`,
				guildID: msg.guild.id,
				guildName: msg.guild.name,
				channelID: msg.channel.id,
				channelName: msg.channel.name,
				name,
				category,
				subcategory
			},
			defaults: { content }
		});

		if (!tag[1]) {
			const clarification = stripIndents`Did you get your parameters mixed up? I received:
				**content**: ${content}
				**name**: ${name || 'N/A'}
				**category**: ${category || 'N/A'}
				**subcategory**: ${subcategory || 'N/A'}`;

			return msg.reply(
				name
					? `A tag with the name **${name}** already exists. ${clarification}`
					: `That tag already exists in **${this.getFullCategory(category, subcategory)}**. ${clarification}`
			);
		}

		return msg.reply(
			name
				? `Tag has been added with the name **${name}**.`
				: `Tag has been added to **${this.getFullCategory(category, subcategory)}**.`
		);
	}

	/**
	 * Delete a tag
	 * @param {CommandMessage} msg
	 * @param {TagArgs} args
	 * @return {Promise<Message|Message[]>}
	 */
	static async delete(msg, args) {
		args = this.sanitizeArgs(args);

		return msg.reply(args.name
			? await this.deleteFromTags(args)
			: await this.deleteFromList(args)
		);
	}

	/**
	 * A list does not use tag names and instead deletes by content.
	 * @param {TagArgs} args
	 * @return {string}
	 */
	static async deleteFromList({ content, category, subcategory }) {
		const where = { content, category };
		if (subcategory) {
			where.subcategory = subcategory;
		}

		const tag = await Tag.findOne({ where });
		if (!tag) {
			return `No such tag exists in **${this.getFullCategory(category, subcategory)}**`;
		}
			
		Tag.destroy({ where: { content, category } });
		return `The tag has been deleted from **${this.getFullCategory(category, subcategory)}**.`;
	}

	/**
	 * Tags do not care about content and delete by name, category, and subcategory
	 * @param {TagArgs} args
	 * @return {string}
	 */
	static async deleteFromTags({ name, category, subcategory }) {
		const where = { name, category };
		if (subcategory) {
			where.subcategory = subcategory;
		}

		const tag = await Tag.findOne({ where });
		if (!tag) {
			return `No such tag with the name **${name}** exists.`;
		}
		
		Tag.destroy({ where });
		return `The tag **${name}** has been deleted.`;
	}
};
