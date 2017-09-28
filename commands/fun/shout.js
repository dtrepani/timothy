const { Command } = require('discord.js-commando');
const EmojiUtil = require('../../util/EmojiUtil');

module.exports = class ShoutCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shout',
			group: 'fun',
			memberName: 'shout',
			description: 'Make your voice big and loud!',
			examples: ['shout "Convert me!"'],
			args: [
				{
					key: 'shout',
					prompt: 'What do you want to shout?',
					type: 'string'
				}
			]
		});
	}

	run(msg, args) {
		const { toEmojiRe } = EmojiUtil;
		const emojifiedShout = args.shout.replace(toEmojiRe, match => {
			const emoji = EmojiUtil.toEmoji(match);
			return emoji || match;
		});
		return msg.reply(`\n${emojifiedShout}`);
	}
};
