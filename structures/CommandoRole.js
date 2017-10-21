const { Role } = require('discord.js');
const { FriendlyError } = require('discord.js-commando');
const { winston } = require('winston');

/**
 * Override the Role.setColor() method to give more in-depth error messages when
 * a role color is unable to be set.
 * @see {@link https://github.com/hydrabolt/discord.js/blob/master/src/structures/Role.js}
 */

const superSetColor = Role.prototype.setColor;

/**
 * @param {ColorResolvable} color The color of the role
 * @param {string} [reason] Reason for changing the role's color
 * @returns {Promise<Role>}
 * @see {@link Role#setColor}
 */
Role.prototype.setColor = function(color, reason) {
	const timothyMember = this.guild.members.get(this.client.user.id);

	if (this.name === '@everyone') {
		throw new FriendlyError(`I cannot change the color of \`@everyone\``);
	}

	if (this.comparePositionTo(timothyMember.highestRole) > 0) {
		throw new FriendlyError(
			`My role is not high enough to set the color of the role \`${this.name}\``
		);
	}

	try {
		return superSetColor.apply(this, [color, reason]);
	} catch (err) {
		winston.warn(`[DISCORD]: RoleSetColorError >`, err);
		throw new FriendlyError(`There was a problem setting the color of the role \`${this.name}\``);
	}
};
