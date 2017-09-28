const { CommandMessage } = require('discord.js-commando');
const winston = require('winston');

/**
 * Responds with a direct message with only an embed.
 * @param {MessageEmbed} [embed] Embed for the message
 * @param {?MessageOptions} [options] Options for the message
 * @return {Promise<Message|Message[]>}
 */
CommandMessage.prototype.directEmbed = function(embed, options) {
	if (!options || typeof options !== 'object') options = {};
	return this.direct('', Object.assign(options, { embed }));
};

/**
 * When replying to a message, Timothy is unusual in that he usually deletes the requester's
 * message and then prefixes their command in his reply. This is done to remove message clutter
 * without removing information.
 * Since the default functionality of CommandMessage does not support such a feature, its reply
 * functions must be overridden.
 * @see {@link https://github.com/Gawdl3y/discord.js-commando/blob/master/src/commands/message.js}
 */

const superReply = CommandMessage.prototype.reply;
const superReplyEmbed = CommandMessage.prototype.replyEmbed;

/**
 * Options provided when sending or editing a message.
 * @typedef {Object} MessageOptionsExt
 * @extends MessageOptions
 * @property {string} [argsDisplay=''] Override the command args display. Useful if the command args are too verbose.
 * Not relevant if the message is a DM.
 * @param {number} [delTimeout=0] - How long to wait to delete the message in milliseconds. Use -1 to disable deletion.
 */

/**
 * @param {StringResolvable} [content] Content for the message
 * @param {?MessageOptionsExt} [options] Options for the message
 * @return {Promise<Message|Message[]>}
 * @see {@link CommandMessage#reply}
 */
CommandMessage.prototype.reply = function(content, options) {
	this.deleteMsg(options);
	return superReply.apply(this, [this.buildReply(content, options), options]);
};

/**
 * @param {MessageEmbed|Object} [embed] Embed to send
 * @param {StringResolvable} [content=''] Content for the message
 * @param {?MessageOptionsExt} [options] Options for the message
 * @return {Promise<Message|Message[]>}
 * @see {@link CommandMessage#replyEmbed}
 */
CommandMessage.prototype.replyEmbed = function(embed, content = '', options) {
	this.deleteMsg(options);
	return superReplyEmbed.apply(this, [embed, this.buildReply(content, options), options]);
};

/**
 * Shortcut to `this.delete()` with error catch
 * @param {?MessageOptionsExt} [options] Options for the message
 * @returns {Promise<Message>}
 * @see {@link CommandMessage#delete}
 * @private
 */
CommandMessage.prototype.deleteMsg = function(options) {
	const timeout = options && typeof options === 'object' ? options.timeout : 0;

	if (timeout >= 0) {
		this.delete(timeout)
			.catch(err => winston.warn(`[DISCORD]: MessageDeleteError > ${err} (Message may have already been deleted)`));
	}
};

/**
 * Concat the user's command with Timothy's reply if the user's message is to be deleted.
 * @return {string}
 * @private
 */
CommandMessage.prototype.buildReply = function(content, options) {
	options = Object.assign({ delTimeout: 0, argsDisplay: '' }, options || {});
	
	return options.delTimeout >= 0
		? `${this.getCommandDisplay(options)}${content}`
		: content;
};

/**
 * Quote the message used to call the command.
 * @return {string}
 * @private
 */
CommandMessage.prototype.getCommandDisplay = function(options) {
	if (this.channel.type === 'dm' || this.channel.type === 'group') {
		return '';
	}

	if (options.argsDisplay !== '') {
		return this.buildCustomizedCommandDisplay(options);
	}

	return `\`${this.cleanContent}\`: `;
};

/**
 * Quoting messages should be as accurate as possible. With custom args display, it's necessary to concat the
 * command name onto the custom args. Using the default command name when the user did not use that specific name
 * should be avoided to make the quote accurate. Parse the content to find the exact command used before
 * joining with the custom args display.
 * @return {string}
 * @private
 */
CommandMessage.prototype.buildCustomizedCommandDisplay = function(options) {
	const argsRe = new RegExp(`^(.+)${this.argString}`);
	const cmdUsed = this.content.match(argsRe)[1];
	return `\`${cmdUsed} ${options.argsDisplay}\`: `;
};
