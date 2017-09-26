const { CommandMessage } = require('discord.js-commando');

/**
 * When replying to a message, Timothy is unusual in that he usually deletes the requester's
 * message and then prefixes their command in his reply. This is done to remove message clutter
 * without removing information.
 * Since the default functionality of CommandMessage does not support such a feature, its reply
 * functions must be overridden.
 * 
 * @see {@link https://github.com/Gawdl3y/discord.js-commando/blob/master/src/commands/message.js}
 */

const superReply = CommandMessage.prototype.reply;
const superReplyEmbed = CommandMessage.prototype.replyEmbed;

/**
 * @see CommandMessage.reply
 * @return {Promise<Message|Message[]>}
 */
CommandMessage.prototype.reply = function(content, options) {
	return superReply.apply(this, [content, options]);
};

/**
 * @see CommandMessage.replyEmbed
 * @return {Promise<Message|Message[]>}
 */
CommandMessage.prototype.replyEmbed = function(embed, content = '', options) {
	return superReplyEmbed.apply(this, [embed, content, options]);
};

/**
 * Responds with a direct message with only an embed.
 * @param {MessageEmbed} [embed] - Embed for the message
 * @param {MessageOptions} [options] - Options for the message
 * @return {Promise<Message|Message[]>}
 */
CommandMessage.prototype.directEmbed = function(embed, options) {
	if (!options || typeof options !== 'object') options = {};
	return this.direct('', Object.assign(options, { embed }));
};
