const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class ColorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'role-color',
			aliases: ['rcolor', 'color-role'],
			group: 'util',
			memberName: 'role-color',
			description: `Set a role's color. Use \`role-color default\` to remove color.`,
			examples: ['color #ffffff', 'color random "Role Name Here"', 'color blue'],
			guildOnly: true,
			args: [
				{
					key: 'color',
					prompt: 'What color?',
					type: 'color'
				},
				{
					key: 'role',
					prompt: 'Change color for what role?',
					type: 'role'
				}
			]
		});
	}

	async run(msg, { color, role }) {
		await role.setColor(color, `Role color command, triggered by ${msg.member.user.tag}`);
		return msg.replyEmbed(new Discord.MessageEmbed({
			description: `Role \`${role.name}\`'s color was set. 🎨`,
			color: Discord.Util.resolveColor(color)
		}));
	}
};
