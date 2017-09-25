const { CommandMessage } = require('discord.js-commando');

const replyFn = CommandMessage.prototype.reply;
const replyEmbedFn = CommandMessage.prototype.replyEmbed;

CommandMessage.prototype.reply = function(content, options) {
	replyFn.apply(this, [content, options]);
};

CommandMessage.prototype.replyEmbed = function(embed, content = '', options) {
	replyEmbedFn.apply(this, [embed, content, options]);
};
