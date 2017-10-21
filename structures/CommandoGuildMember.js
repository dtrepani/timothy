const { GuildMember } = require('discord.js');

/**
 * @param {ColorResolvable} color The color of the user
 * @param {string} [reason] Reason for changing the user's color
 * @returns {Promise<GuildMember>}
 * @see {@link https://github.com/hydrabolt/discord.js/blob/master/src/structures/GuildMember.js}
 */
GuildMember.prototype.setColor = function(color, reason) {
	/**
	 * Prioritize the role used to set the user's current color followed
	 * by the user's highest role.
	 * @type {Role}
	 */
	const colorRole = this.colorRole || this.highestRole;
	colorRole.setColor(color, reason);
};
