const { Command } = require('discord.js-commando');
const moment = require('moment');
const { stripIndents } = require('common-tags');
const { EMBED_BULLET, EMBED_ARROW } = process.env;

const username = require('../../models/UserName');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'user-info',
			aliases: ['user'],
			group: 'info',
			memberName: 'user-info',
			description: 'Get info on a user.',
			details: `Get detailed information on the specified user.`,
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'member',
					prompt: 'what user would you like to have information on?\n',
					type: 'member',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		const member = args.member || msg.member;
		const { user } = member;
		const usernames = await username.findAll({ where: { userID: user.id } });
		const statusMap = {
			online: `Online :green_heart:`,
			offline: `Offline :black_heart:`,
			idle: `Idle :yellow_heart:`,
			dnd: `Do Not Disturb :heart:`
		};

		return msg.replyEmbed({
			color: 3447003,
			description: `**${user.bot ? 'Bot' : 'User'} ${member} Statistics**`,
			footer: { text: `User ID: ${user.id}` },
			fields: [
				{
					name: `${EMBED_ARROW} Member Details`,
					value: stripIndents`
						${EMBED_BULLET} **Nickname**: ${member.nickname || 'N/A'}
						${EMBED_BULLET} **Roles**: ${member.roles.map(roles => `\`${roles.name}\``).join(' ')}
						${EMBED_BULLET} **Joined**: ${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, hh:mm:ss A')} UTC
					`
				},
				{
					name: `${EMBED_ARROW} User Details`,
					/* eslint-disable max-len */
					value: stripIndents`
						${EMBED_BULLET} **Created**: ${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, hh:mm:ss A')} UTC
						${EMBED_BULLET} **Aliases**: ${usernames.length ? usernames.map(uName => uName.username).join(', ') : user.username}
						${EMBED_BULLET} **Status**: ${statusMap[user.presence.status] || statusMap.offline}
						${EMBED_BULLET} **Game**: ${user.presence.game ? user.presence.game.name : 'N/A'}
					`
					/* eslint-enable max-len */
				}
			],
			thumbnail: { url: user.displayAvatarURL({ format: 'png' }) }
		});
	}
};
