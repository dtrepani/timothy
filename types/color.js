const { ArgumentType } = require('discord.js-commando');
const Util = require('../util/Util');

module.exports = class ColorArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'color');
	}

	/**
	 * Util#resolveColor will throw an error if the value
	 * is not a valid color.
	 */
	validate(value) {
		try {
			Util.resolveColor(value.toUpperCase());
			return true;
		} catch (err) {
			return false;
		}
	}

	parse(value) {
		return Util.resolveColor(value.toUpperCase());
	}
};
