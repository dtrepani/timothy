const { ArgumentType } = require('discord.js-commando');
const EmojiUtil = require('../util/EmojiUtil');

class EmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'emoji');
	}

	validate(value, msg) {
		if (value.match(EmojiUtil.customEmojiRe)) {
			const emoji = msg.client.emojis.get(value.match(EmojiUtil.customEmojiRe)[2]);
			if (emoji) return true;
		} else if (value.match(EmojiUtil.emojiRe)) {
			return true;
		}

		return false;
	}

	parse(value, msg) { // eslint-disable-line consistent-return
		if (value.match(EmojiUtil.customEmojiRe)) {
			const emoji = msg.client.emojis.get(value.match(EmojiUtil.customEmojiRe)[2]);
			if (emoji) return emoji;
		} else if (value.match(EmojiUtil.emojiRe)) {
			return value.match(EmojiUtil.emojiRe)[0];
		}
	}
}

module.exports = EmojiArgumentType;
