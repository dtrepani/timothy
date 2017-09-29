const { Command } = require('discord.js-commando');
const ImagesUtil = require('../../util/ImagesUtil');

module.exports = class BirdCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bird',
			aliases: ['birds', 'birb', 'birb'],
			group: 'images',
			memberName: 'bird',
			description: 'Birb!!!!!!'
		});
	}

	async run(msg) {
		return msg.replyEmbed(await ImagesUtil.getRandomImage(
			this.client,
			'birbs',
			'https://i.imgur.com/Fj6YtQY.gifv'
		));
	}
};
