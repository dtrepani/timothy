const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

module.exports = class EightBallCommand extends Command {
	constructor(client) {
		super(client, {
			name: '8ball',
			aliases: ['8-ball', 'eight-ball'],
			group: 'fun',
			memberName: '8ball',
			description: `Find out the answer to life's many questions.`,
			args: [
				{
					key: 'question',
					prompt: 'What question would you like to ask?',
					type: 'string'
				}
			]
		});

		this.answers = [];
	}

	run(msg) {
		if (this.answers.length === 0) {
			try {
				const pathName = path.join(__dirname, '../../assets/8ball.json');

				fs.accessSync(pathName, fs.constants.F_OK);
				this.answers = JSON.parse(fs.readFileSync(pathName));
			} catch (err) {
				winston.error('[DISCORD]: 8BallFileReadError >', err);
				return msg.reply('lol :8ball:');
			}
		}

		const rand = Math.floor(Math.random() * this.answers.length);
		return msg.reply(`${this.answers[rand]} :8ball:`);
	}
};
