module.exports = class EmojiUtil {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * @readonly
	 */
	static get supportedEmojisMap() {
		return {
			'!': '❕',
			'?': '❔',
			'.': '⏺️',
			'#': '#️⃣'
		};
	}

	/**
	 * @readonly
	 */
	static get emojiRanges() {
		return [
			'\ud83c[\udf00-\udfff]',
			'\ud83d[\udc00-\ude4f]',
			'\ud83d[\ude80-\udeff]',
			'[\u0023-\u0039]\u20E3',
			'[\u2002-\u21AA]',
			'[\u231A-\u27bf]',
			'[\u2934-\u2b55]',
			'\u3030', '\u303D',
			'\u3297', '\u3299',
			'\uD83C[\udc04-\uDFFF]',
			'\uD83D[\uDC00-\uDE4F]'
		];
	}

	/**
	 * @readonly
	 */
	static get emojiRe() {
		return new RegExp(EmojiUtil.emojiRanges.join('|'), 'g');
	}

	/**
	 * @readonly
	 */
	static get customEmojiRe() {
		return /<:([a-zA-Z0-9_]+):(\d+)>/;
	}

	static get toEmojiRe() {
		const alphanumeric = 'a-zA-Z0-9';
		const supportedMisc = Object.keys(EmojiUtil.supportedEmojisMap).join('');
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
		} else if (this.supportedEmojisMap.hasOwnProperty(char)) {
			emoji = this.supportedEmojisMap[char];
		}

		return `${emoji}\u200B`;
	}
};
