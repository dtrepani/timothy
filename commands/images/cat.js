const { Command } = require('discord.js-commando');
const ImagesUtil = require('../../util/ImagesUtil');

module.exports = class CatCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cat',
			aliases: ['cats'],
			group: 'images',
			memberName: 'cat',
			description: 'Cats! So many cats!'
		});
	}

	async run(msg) {
		return msg.replyEmbed(await ImagesUtil.getRandomImage(
			this.client,
			'cats',
			'https://i.imgur.com/Bai6JTL.jpg'
		));
	}
};
