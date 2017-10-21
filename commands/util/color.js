const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class ColorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'color',
			aliases: ['user-color'],
			group: 'util',
			memberName: 'color',
			description: oneLine`Set a user's color. If no user is specified, set your own color.
				Use \`color default\` to remove color.`,
			examples: ['color #ffffff', 'color random @Foo#1234', 'color blue'],
			guildOnly: true,
			args: [
				{
					key: 'color',
					prompt: 'What color?',
					type: 'color'
				},
				{
					key: 'target',
					prompt: 'Change whose color?',
					type: 'member',
					default: ''
				}
			]
		});
	}

	/**
	 * Set a user's color. Prioritize the role used to set the user's current color followed
	 * by the user's highest role.
	 */
	async run(msg, { color, target }) {
		if (!target) {
			target = msg.member;
		}

		await target.setColor(color, `Color command, triggered by ${msg.member.user.tag}`);
		return msg.replyEmbed(new Discord.MessageEmbed({
			description: `${target}'s color was set. 🎨`,
			color
		}));
	}
};
