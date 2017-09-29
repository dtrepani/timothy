const { Command } = require('discord.js-commando');
const ImagesUtil = require('../../util/ImagesUtil');

module.exports = class SnekCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'snek',
			aliases: ['sneks', 'snake', 'snakes'],
			group: 'images',
			memberName: 'snek',
			description: 'Hissssssssssss'
		});
	}

	async run(msg) {
		return msg.replyEmbed(await ImagesUtil.getRandomImage(
			this.client,
			'sneks',
			'https://i.imgur.com/OgQx3QK.gifv'
		));
	}
};
