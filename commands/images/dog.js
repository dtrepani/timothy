const { Command } = require('discord.js-commando');
const ImagesUtil = require('../../util/ImagesUtil');

module.exports = class DogCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dog',
			aliases: ['dogs'],
			group: 'images',
			memberName: 'dog',
			description: 'wow such doge much want'
		});
	}

	async run(msg) {
		return msg.replyEmbed(await ImagesUtil.getRandomImage(
			this.client,
			'dogpictures',
			'https://i.imgur.com/3cZP8w5.jpg'
		));
	}
};
