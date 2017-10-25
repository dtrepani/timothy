const Sequelize = require('sequelize');

const Database = require('../structures/PostgreSQL');

const Tag = Database.db.define(
	'tags',
	{
		userID: Sequelize.STRING,
		userName: Sequelize.STRING,
		guildID: Sequelize.STRING,
		guildName: Sequelize.STRING,
		channelID: Sequelize.STRING,
		channelName: Sequelize.STRING,
		name: {
			type: Sequelize.STRING,
			allowNull: true
		},
		content: {
			type: Sequelize.STRING(1800), // eslint-disable-line new-cap
			allowNull: false
		},
		category: {
			type: Sequelize.STRING,
			defaultValue: null,
			allowNull: true
		},
		subcategory: {
			type: Sequelize.STRING,
			defaultValue: null,
			allowNull: true
		},
		uses: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		}
	},
	{
		indexes: [
			{
				name: 'IX_Tag_Name_Content_Category_Subcategory',
				unique: true,
				fields: ['name', 'content', 'category', 'subcategory']
			}
		]
	}
);

Tag.prototype.getFullCategory = function() {
	return `${this.category}${this.subcategory ? `/${this.subcategory}` : ''}`;
};

module.exports = Tag;
