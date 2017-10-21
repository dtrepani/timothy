const { Command } = require('discord.js-commando');

module.exports = class RollCommand extends Command {
	/**
	 * @typedef {Object} RollInfo
	 * @property {int} numOfDice
	 * @property {int} numOfSides
	 */

	constructor(client) {
		const format = '[# of dice]d[# of sides]';
		const rollRe = /^(\d{1,20})d(\d{1,50})$/i;

		super(client, {
			name: 'roll',
			group: 'fun',
			memberName: 'roll',
			description: 'Roll them dice! :game_die:',
			examples: ['roll 1d10'],
			args: [
				{
					key: 'roll',
					prompt: `Roll what? (${format})`,
					validate: roll => {
						const isValid = rollRe.test(roll);
						if (!isValid) {
							return `Rolls must be in the format of ${format}.`;
						}

						return true;
					},
					parse: roll => {
						const rollMatches = roll.match(rollRe);
						return { numOfDice: parseInt(rollMatches[1]), numOfSides: parseInt(rollMatches[2]) };
					}
				}
			]
		});

		this.format = format;
	}

	run(msg, args) {
		const diceRolls = this.rollAllDice(args.roll);
		const rollTotal = diceRolls.reduce((roll1, roll2) => (roll1 + roll2), 0);
		const diceRollsStr = ((diceRolls.length > 1)
			? `[${diceRolls.join(' + ')}]`
			: ``);

		return msg.reply(`${rollTotal.toLocaleString()} :game_die: ${diceRollsStr}`);
	}

	/**
	 * @param {RollInfo} [roll] Roll info containing number of dice and sides
	 * @return {integer} Each dice roll
	 * @private
	 */
	rollAllDice(roll) {
		const diceRolls = [];

		for (let i = 0; i < roll.numOfDice; i++) {
			diceRolls.push(this.rollSingleDice(roll.numOfSides));
		}

		return diceRolls;
	}

	/**
	 * @return {integer}
	 * @private
	 */
	rollSingleDice(numOfSides) {
		return Math.floor(Math.random() * numOfSides) + 1;
	}
};
