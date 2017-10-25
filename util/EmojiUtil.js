const { EmojiMap, EmojiReRanges } = require('./constants');

module.exports = class EmojiUtil {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * @readonly
	 */
	static get emojiRe() {
		return new RegExp(EmojiReRanges.join('|'), 'g');
	}

	/**
	 * @readonly
	 */
	static get customEmojiRe() {
		return /<:([a-zA-Z0-9_]+):(\d+)>/;
	}

	static get toEmojiRe() {
		const alphanumeric = 'a-zA-Z0-9';
		const supportedMisc = Object.keys(EmojiMap).join('');
		const nonCaptureGroup = `(?:${this.customEmojiRe.source})`; // Match, but do not capture.
		return new RegExp(`${nonCaptureGroup}|([${alphanumeric}${supportedMisc}])`, 'g');
	}

	/**
	 * Convert a char to its emoji equivalent. A zero-width space is added after emoji to prevent
	 * unintentional UTF16 surrogate pairs.
	 */
	static toEmoji(char) {
		let emoji = '';

		if (/[a-zA-Z]/.test(char)) {
			const hexToAdd = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
			emoji = String.fromCodePoint(0xd83c, (0xdde6 + hexToAdd));
		} else if (/[0-9*#]/.test(char)) {
			emoji = String.fromCodePoint(char.charCodeAt(0), 0x20e3);
		} else if (EmojiMap.hasOwnProperty(char)) {
			emoji = EmojiMap[char];
		}

		return `${emoji}\u200B`;
	}
};
