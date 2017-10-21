const { Role } = require('discord.js');
const DiscordUtil = require('discord.js').Util;
const { FriendlyError } = require('discord.js-commando');
const { winston } = require('winston');
const { Colors } = require('./constants');

class Util {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	static cleanContent(msg, content) {
		return content.replace(/@everyone/g, '@\u200Beveryone')
			.replace(/@here/g, '@\u200Bhere')
			.replace(/<@&[0-9]+>/g, roles => {
				const replaceID = roles.replace(/<|&|>|@/g, '');
				const role = msg.channel.guild.roles.get(replaceID);

				return `@${role.name}`;
			})
			.replace(/<@!?[0-9]+>/g, user => {
				const replaceID = user.replace(/<|!|>|@/g, '');
				const member = msg.channel.guild.members.get(replaceID);

				return `@${member.user.username}`;
			});
	}

	static isNumber(number) {
		return (!isNaN(number) && isFinite(number));
	}

	static isString(str) {
		return typeof str === 'string' || str instanceof String;
	}

	static isUrl(item) {
		return (item.search(/https?:\/\/[^ \/\.]+\.[^ \/\.]+/) !== -1); // eslint-disable-line no-useless-escape
	}

	/**
	 * Resolves a ColorResolvable into a color number.
	 * 
	 * As of 10/21/2017, discord.js Util#resolveColor has a bug
	 * where its isNaN check is never called, so its return value
	 * must be manually checked.
	 * 
	 * @param {ColorResolvable} color Color to resolve
	 * @returns {number} A color
	 * @override
	 */
	static resolveColor(color) {
		if (typeof color === 'string' && Colors.hasOwnProperty(color)) {
			return Colors[color];
		}

		color = DiscordUtil.resolveColor(color);
		
		if (isNaN(color)) {
			throw new TypeError('COLOR_CONVERT');
		}

		return color;
	}

	/**
	 * @param {string|Role} role - Role to resolve
	 * @param {Guild} guild - Guild to resolve against
	 * @return {Role} - Resolved role
	 */
	static resolveRole(role, guild) {
		if (role instanceof String) {
			role = guild.roles.find(aRole => aRole.name.toLowerCase() === role.toLowerCase());
		}

		if (!(role instanceof Role)) {
			throw new TypeError('ROLE_CONVERT');
		}

		return role;
	}

	/**
	 * Create a role and immediately add a user to the role.
	 * @param {RoleData} roleData - Data to make role
	 * @param {GuildMember} member - User to add to role 
	 * @param {string} [reason] - Reason for making role and adding user to it
	 * @return {Role}
	 * @private
	 */
	static async createAndAddMemberToRole(roleData, member, reason) {
		try {
			const role = await member.guild.createRole({
				data: roleData,
				reason
			});
			await member.addRole(role, reason);
			return role;
		} catch (err) {
			winston.warn(`[DISCORD]: CreateAndAddMemberToRoleError >`, err);
			throw new FriendlyError(
				`There was a problem creating the \`${roleData.name}\` role and adding ${member.displayName} to it.`
			);
		}
	}
}

module.exports = Util;
