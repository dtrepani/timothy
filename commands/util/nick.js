const { Command, FriendlyError } = require('discord.js-commando');
const { Permissions } = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class NickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'nick',
			aliases: ['nickname'],
			group: 'util',
			memberName: 'nick',
			description: `Set a your own or another user's nickname.`,
			details: oneLine`Remember to encapsulate multi-word nicknames in quotations. 
				Use "nick remove" to remove nicknames.`,
			examples: [
				'nick "My New Nickname"',
				'nick "[BANNED] Some Nerd" @Kyuu#9384',
				'nick remove @Kyuu#9384'
			],
			guildOnly: true,
			args: [
				{
					key: 'nickname',
					prompt: 'What nickname?',
					type: 'string',
					max: 32
				},
				{
					key: 'target',
					prompt: 'For which user?',
					type: 'member',
					default: ''
				}
			]
		});
	}

	hasPermission({ member }) {
		return member.hasPermission(Permissions.MANAGE_NICKNAMES)
			|| member.hasPermission(Permissions.ADMINISTRATOR);
	}

	run(msg, args) {
		const { guild, member } = msg;
		let { nickname, target } = args;

		if (!target) {
			target = member;
		}

		if (nickname.toLowerCase() === 'remove') {
			nickname = '';
		}

		if (target === guild.owner) {
			throw new FriendlyError(`I can't change the nickname of the server owner. 😢`);
		}

		const timothyMember = guild.members.get(this.client.user.id);
		const targetHighestRole = target.highestRole;
		if (timothyMember.highestRole.comparePositionTo(targetHighestRole) < 0) {
			throw new FriendlyError(
				oneLine`My role is not high enough to set the nickname of
				${(target === member) ? 'your' : `that user`}.
				${(target === member) ? 'Your' : 'Their'} highest role is above mine.`
			);
		}

		return this.changeNickname(msg, nickname, target);
	}

	async changeNickname(msg, nickname, target) {
		try {
			await target.setNickname(nickname);
			return msg.reply(`${target}'s nickname has been changed.`);
		} catch (err) {
			throw new FriendlyError(oneLine`I can't change that user's nickname. 
				Ask the server's owner to move my role rank up.`);
		}
	}
};
