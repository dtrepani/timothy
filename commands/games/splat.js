const { Command, FriendlyError } = require('discord.js-commando');
const Discord = require('discord.js');
const Util = require('../../util/Util');
const winston = require('winston');

module.exports = class ColorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'splat',
			aliases: ['splatoon'],
			group: 'games',
			memberName: 'splat',
			description: `Splat your friends with a color for 30 seconds.`,
			examples: ['splat #ffffff @Kyuu#9384', 'splat blue @Kyuu#9384'],
			args: [
				{
					key: 'color',
					prompt: 'What color?',
					type: 'color'
				},
				{
					key: 'target',
					prompt: 'Splat which user?',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		const { color, target } = args;
		const { member, guild } = msg;

		const roleName = `Splat ${target.user.username}#${target.user.discriminator}`;
		let role = msg.guild.roles.find('name', roleName);

		if (!role) {
			role = await this.createSplatRole(msg, args, roleName);
		} else {
			await role.setColor(color, this.getReason(member));
		}

		msg.replyEmbed(new Discord.MessageEmbed({
			title: 'SPLAT!',
			description: `**${target} was splat by ${member}!**`,
			thumbnail: { url: 'http://i.imgur.com/Nsj5Q24.png' },
			color
		}));

		this.client.setTimeout(async () => {
			try {
				await role.delete();
				msg.embed(new Discord.MessageEmbed({
					description: `${target.displayName} is back to their original color! 🎉`,
					color
				}));
			} catch (err) {
				winston.warn(`[DISCORD]: SplatDeleteRoleError >`, err);
				msg.say(`I had some trouble setting ${target.displayName} back to their original color...`);
			}
		}, 60000);
	}

	/**
	 * @param {CommandMessage} msg 
	 * @param {*} args
	 * @param {string} roleName 
	 * @return {Role}
	 * @private
	 */
	createSplatRole({ member, guild }, { color, target }, roleName) {
		const timothyHighestRole = guild.members.get(this.client.user.id).highestRole;
		let rolePosition = timothyHighestRole.position - 1;

		/**
		 * If target already has a color role, Timothy must be able to add a role
		 * above that current role in order to change their color.
		 */
		const targetRole = target.colorRole;
		if (targetRole) {
			rolePosition = targetRole.position + 1;
		}

		if (timothyHighestRole.position <= rolePosition) {
			throw new FriendlyError(`My role is not high enough to splat that user!`);
		}

		return Util.createAndAddMemberToRole(
			{
				name: roleName,
				color,
				position: rolePosition
			},
			target,
			this.getReason(member)
		);
	}

	/**
	 * The reason for everything this command does.
	 * @param {GuildMember} member
	 * @return {string} The reason
	 * @private
	 */
	getReason(member) {
		return `Splat command, triggered by ${member.user.tag}`;
	}
};
