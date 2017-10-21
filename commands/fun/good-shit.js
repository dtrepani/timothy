const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

module.exports = class GoodShitCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'good-shit',
			group: 'fun',
			memberName: 'good-shit',
			description: '👌👌 👌 💯 👌 👀 👀 👀 👌👌'
		});

		this.list = [];
	}

	run(msg) {
		try {
			if (this.list.length === 0) {
				const pathName = path.join(__dirname, '../../assets/good-shit.json');
				
				fs.accessSync(pathName, fs.constants.F_OK);
				this.list = JSON.parse(fs.readFileSync(pathName));
			}
			const output = this.list[Math.floor(Math.random() * this.list.length)];
			return msg.reply(output);
		} catch (err) {
			winston.error('[DISCORD]: GoodShitFileReadError >', err);
			return msg.reply(oneLine`👌👀👌👀👌👀👌👀👌👀 good shit go౦ԁ sHit👌 thats ✔ some good👌👌shit 
				right👌👌th 👌 ere👌👌👌 right✔there ✔✔if i do ƽaү so my selｆ 💯 i say so 💯 thats what im talking 
				about right there right there (chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ) mMMMMᎷМ💯 👌👌 👌НO0ОଠＯOOＯOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ👌 
				👌👌 👌 💯 👌 👀 👀 👀 👌👌Good shit`);
		}
	}
};
