const { Command } = require('discord.js-commando');
const { Emoji } = require('discord.js');
const EmojiUtil = require('../../util/EmojiUtil');
const twemoji = require('twemoji');

module.exports = class EmojiCommand extends Command {
	/**
	 * @typedef EmojiInfo
	 * @property {string} [img] Image URL
	 * @property {string} [baseName] Base name of the custom emoji, if applicable.
	 * 	@example :doge: instead of :doge:276192942710849536
	 */

	constructor(client) {
		super(client, {
			name: 'emoji',
			aliases: ['emojis'],
			group: 'fun',
			memberName: 'emoji',
			description: 'Get a bigger emoji.',
			args: [
				{
					key: 'emoji',
					prompt: 'What emoji?',
					type: 'emoji'
				}
			]
		});
	}

	run(msg, args) {
		const { emoji } = args;

		if (emoji instanceof Emoji) {
			return msg.reply(
				'',
				{
					argsDisplay: `:${emoji.name}:`,
					files: [{ attachment: emoji.url }]
				}
			);
		}

		let emojiImg = null;
		twemoji.parse(emoji, {
			callback: (iconId, options) => {
				emojiImg = `${options.base}${options.size}/${iconId}${options.ext}`;
			}
		});

		return msg.reply(emoji, { files: [{ attachment: emojiImg }] });
	}
};
