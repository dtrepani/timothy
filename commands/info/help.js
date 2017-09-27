const { Command, FriendlyError, util } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const { EMBED_BULLET, EMBED_ARROW, ZERO_WIDTH_SPACE } = process.env;
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

/**
 * The default help command does not support outputting to server. It has no methods outside the
 * constructor and run(), so overriding only the relevant methods is not an option. As such, this
 * is almost a complete copy of the logic behind the default help command.
 * @see Schuyler Cebulskie (Gawdl3y) {@link https://github.com/Gawdl3y}
 * @see {@link https://github.com/Gawdl3y/discord.js-commando/blob/master/src/commands/util/help.js}
 */
module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'info',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,
			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});

		this._embedColor = parseInt('51c151', 16);
	}
	
	async run(msg, args) {
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showCommandsHere = (args.command && args.command.toLowerCase() === 'here');
		const showAllCommands = (args.command && args.command.toLowerCase() === 'all');
		
		try {
			if (!args.command || showAllCommands) return await this._showCommandsInDM(msg, showAllCommands);
			if (showCommandsHere) return this._showAllCommandsInChannel(msg);
			if (commands.length === 1) return this._showSingleCommand(msg, commands[0]);
			if (commands.length > 1) return msg.reply(util.disambiguation(commands, 'commands'));

			return msg.reply(
				`Unable to identify command. Use ${msg.usage(null, null, null)} to view the list of all commands.`
			);
		} catch (err) {
			winston.error(err);
			throw new FriendlyError(err);
		}
	}

	_showSingleCommand(msg, command) {
		const help = new MessageEmbed({
			title: `__${command.name}__`,
			description: `${command.description}`,
			color: this._embedColor,
			fields: [
				{
					name: `${EMBED_ARROW} Server Only`,
					value: command.guildOnly ? 'Yes' : 'No',
					inline: true
				},
				{
					name: `${EMBED_ARROW} Group`,
					value: `${command.group.name} (\`${command.groupID}:${command.memberName}\`)`,
					inline: true
				},
				{
					name: `${EMBED_ARROW} Format`,
					value: msg.anyUsage(`${command.name}${command.format ? ` ${command.format}` : ''}`)
				}
			]
		});

		if (command.details) help.addField(`${EMBED_ARROW} Details`, command.details);
		if (command.examples && command.examples.length > 0) {
			help.addField(
				`${EMBED_ARROW} Examples`,
				`${EMBED_BULLET} ${command.examples.join(`\n${EMBED_BULLET} `)}`
			);
		}

		return msg.replyEmbed(help);
	}

	_showAllCommandsInChannel(msg) {
		const help = this._constructCommandsHelp(msg, false, true, ', ', cmd => `${cmd.name}`);
		return msg.replyEmbed(help);
	}

	_showCommandsInDM(msg, showAllCommands) {
		const help = this._constructCommandsHelp(
			msg,
			true,
			showAllCommands,
			'\n',
			cmd => `${EMBED_BULLET} **${cmd.name}**: ${cmd.description}`
		);

		const messages = [];
		try {
			if (msg.channel.type !== 'dm') messages.push(msg.reply('Sent you a DM with information.'));
			messages.push(msg.directEmbed(help));
		} catch (err) {
			messages.push(msg.reply(
				oneLine`Unable to send you the help DM. You probably have DMs disabled. 
					Alternatively, you can use \`help here\` to post the commands here.`
			));
		}
		return Promise.all(messages);
	}

	/**
	 * How the commands within a command group are formatted for displaying in help.
	 * @callback cmdFormatCallback
	 * @param {Command} cmd - Command to be formatted
	 * @returns {string}
	 */

	/**
	 * Format command groups and their respective commands into a list.
	 * @param {CommandMessage} msg
	 * @param {boolean} sendingToDM - Whether the help is going to a DM
	 * @param {boolean} showAllCommands
	 * @param {string} delimiter - How to separate commands when made into a string
	 * @param {cmdFormat} callback
	 * @returns {string}
	 */
	_constructCommandsHelp(msg, sendingToDM, showAllCommands, delimiter, callback) {
		const title = showAllCommands
			? 'All Commands'
			: `Available Commands In ${msg.guild || 'This DM'}`;
		const usagePrefix = msg.guild ? msg.guild.commandPrefix : null;
		const moreInfo = sendingToDM
			? stripIndents`
				To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
				Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.`
			: `Use ${this.usage('', null, null)} to view a list of commands with their descriptions.`;
		const description = stripIndents`
			${oneLine`
				To run a command in ${msg.guild || 'any server'},
				use ${Command.usage('command', usagePrefix, this.client.user)}.
				For example, ${Command.usage('prefix', usagePrefix, this.client.user)}.`}
			${moreInfo}
			Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.`;
		
		return new MessageEmbed({
			title: `__${title}__`,
			description,
			color: this._embedColor,
			fields: this._getCmdGroupsFields(msg, showAllCommands, delimiter, callback)
		});
	}

	/**
	 * Format command groups and their respective commands into a list.
	 * @param {CommandMessage} msg
	 * @param {boolean} showAllCommands
	 * @param {string} delimiter
	 * @param {cmdFormatCallback} callback
	 * @returns {string}
	 */
	_getCmdGroupsFields(msg, showAllCommands, delimiter, callback) {
		let { groups } = this.client.registry;
		if (showAllCommands) groups = groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg)));

		const fieldInfoForGroups = groups.map(group => {
			const commands = showAllCommands
				? group.commands
				: group.commands.filter(cmd => cmd.isUsable(msg));
			return this._getFieldInfoForGroup(group, commands.map(callback), delimiter);
		});
		
		return this._constructEmbedFields(fieldInfoForGroups);
	}

	/**
	 * @typedef {Object} FieldInfo
	 * @property {string} name - Field name
	 * @property {Array<string>} values - List of commands, separated into multiple fields if
	 * 										max length of one is over 1024
	 */

	/**
	 * Fields can only have a max length of 1024. If a field goes over the limit, construct a new field to continue
	 * the commands. Once all groups have been mapped, call _constructEmbedFields() to properly construct the fields.
	 * @param {CommandGroup} group
	 * @param {Array<string>} commands
	 * @param {string} delimiter
	 * @returns {FieldInfo}
	 */
	_getFieldInfoForGroup(group, commands, delimiter) {
		const maxLen = 1024;
		const fieldValues = [''];
		let fieldInd = 0;

		for (let i = 0; i < commands.length; i++) {
			const cmd = `${commands[i]}${i === (commands.length - 1) ? '' : delimiter}`;
			if (fieldValues[fieldInd].length + cmd.length > maxLen) {
				fieldInd++;
				fieldValues[fieldInd] = '';
			}

			fieldValues[fieldInd] += cmd;
		}

		return {
			name: `${EMBED_ARROW} ${group.name}`,
			values: fieldValues
		};
	}

	/**
	 * @see _getFieldInfoForGroup()
	 * @param {Array<FieldInfo>} fieldsInfo
	 * @returns {Array<{name: string, value: string}>} Array of Embed fields
	 */
	_constructEmbedFields(fieldsInfo) {
		const fields = [];
		fieldsInfo.forEach(groupInfo => {
			for (let i = 0; i < groupInfo.values.length; i++) {
				fields.push({
					name: (i === 0) ? groupInfo.name : ZERO_WIDTH_SPACE,
					value: groupInfo.values[i]
				});
			}
		});
		return fields;
	}
};
