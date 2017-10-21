const { Command, FriendlyError } = require('discord.js-commando');
const Discord = require('discord.js');
const Util = require('../../util/Util');
const winston = require('winston');

module.exports = class JarpyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'jarpy',
			aliases: ['jarpies', 'jarpie'],
			group: 'fun',
			memberName: 'jarpy',
			description: `💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕`,
			examples: ['jarpy @Puffershark#3706'],
			guildOnly: true,
			args: [
				{
					key: 'target',
					prompt: 'Jarpy which user?',
					type: 'member'
				},
				{
					// No one ever remembers the max number of throws they can use, so don't set.
					key: 'numOfThrows',
					prompt: 'How many times? I can jarpy 1 to 10 times.',
					type: 'integer',
					default: 1,
					min: 1
				}
			]
		});

		this.jarpyTimeouts = [];

		this.heart = '💕';
		this.maxNameLen = 32; // Determined by Discord

		this.baseJarpyEmbed = {
			thumbnail: { url: 'http://i.imgur.com/IM50OVK.png' }, // TODO: upload to personal imgur
			color: Util.resolveColor('#E494A0')
		};
	}

	async run(msg, args) {
		const { target } = args;
		const numOfThrows = Math.min(args.numOfThrows, this.maxNameLen / 2);

		if (target === msg.guild.owner) {
			throw new FriendlyError(`I can't jarpy the server owner. 😭`);
		}

		try {
			let isAlreadyJarpied = true;
			let origNickname = await this.client.redis.hgetAsync('jarpy:nickname', target.user.id);
			if (origNickname === null || origNickname === undefined) {
				origNickname = target.nickname || '';
				this.client.redis.hsetAsync('jarpy:nickname', target.user.id, origNickname);
				isAlreadyJarpied = false;
			}

			await this.setJarpies(target, numOfThrows, isAlreadyJarpied);
			msg.replyEmbed(
				this._getJarpyEmbed(msg.member, target),
				'',
				{ argsDisplay: `\@${target.user.username}${numOfThrows === 1 ? '' : ` ${numOfThrows}`}` } // eslint-disable-line no-useless-escape, max-len
			);
			
			return this.clearJarpies(msg, target, origNickname);
		} catch (err) {
			winston.warn(`[DISCORD]: JarpyError >`, err);
			throw new FriendlyError(`I can't jarpy that user. Ask the server's owner to move my role rank up.`);
		}
	}

	async setJarpies(target, numOfThrows, isAlreadyJarpied) {
		const nickname = target.nickname || target.user.username;
		await target.setNickname(this.getJarpiedName(nickname, numOfThrows, isAlreadyJarpied));
	}

	getJarpiedName(nickname, numOfThrows, isAlreadyJarpied) {
		if (this.isFullyJarpied(nickname)) {
			return nickname;
		}

		const hearts = this.heart.repeat(numOfThrows);

		// Don't account for padding if the user is already jarpied.
		const namePadding = isAlreadyJarpied ? 0 : 2;

		// Remove space for padding if needed
		nickname = !isAlreadyJarpied && nickname.length === this.maxNameLen
			? nickname.slice(0, -namePadding)
			: nickname;
		const spaceLeft = this.maxNameLen - nickname.length - namePadding;

		// Truncate user's name if not enough space is left for the hearts
		if (spaceLeft <= hearts.length * 2) {
			const diff = (hearts.length * 2) - spaceLeft;
			nickname = nickname.slice(0, -diff);
		}

		return (nickname.length === 0)
			? `${hearts}${hearts}`
			: `${hearts} ${nickname} ${hearts}`;
	}

	/**
	 * Users with a nickname of hearts cannot be jarpied any further.
	 * @private
	 */
	isFullyJarpied(nickname) {
		return nickname === this.heart.repeat(this.maxNameLen);
	}

	clearJarpies(msg, target, origNickname) {
		const jarpyTimeout = this.jarpyTimeouts[target.user.id];
		if (jarpyTimeout) {
			this.client.clearTimeout(jarpyTimeout.data.handleId);
		}

		this.jarpyTimeouts[target.user.id] = this.client.setTimeout(
			() => {
				target.setNickname(origNickname || '')
					.then(() => {
						const embed = new Discord.MessageEmbed({
							title: '💔💔💔💔💔💔💔💔',
							description: `\@${target.user.username}'s jarpies have worn off!` // eslint-disable-line no-useless-escape, max-len
						});

						this.client.redis.hdel('jarpy:nickname', target.user.id);

						return msg.embed(Object.assign(embed, this.baseJarpyEmbed)); // eslint-disable-line consistent-return, max-len
					});
			},
			5000 // 60000
		);
	}

	_getJarpyEmbed(jarpier, target) {
		const embed = new Discord.MessageEmbed({
			title: '💕💕💕💕💕💕💕💕',
			description: `${target} (@${target.user.username}) **just got jarpied by ${jarpier}!**`
		});
		return Object.assign(embed, this.baseJarpyEmbed);
	}
};
