const { MessageEmbed } = require('discord.js');
const request = require('request-promise');
const winston = require('winston');

module.exports = class ImagesUtil {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * Get a random image from a subreddit. Caches expire after 24 hours.
	 * Returns an embed instead of a URL to avoid unwanted Imgur metadata from appearing in response.
	 * @param {CommandoClient} client - Commando client
	 * @param {string} subreddit - Subreddit to pull from
	 * @param {string} defaultImg - A default image to use should an error occur
	 * @return {MessageEmbed} - Message embed with image URL
	 */
	static async getRandomImage(client, subreddit, defaultImg) {
		const key = `images:${subreddit}`;
		let cache = await client.redis.getAsync(key);

		if (!cache) {
			cache = await ImagesUtil.getImages(subreddit);
			client.redis.setAsync(key, JSON.stringify(cache));
			client.redis.expireAsync(key, 24 * 60 * 60);
		} else {
			cache = JSON.parse(cache);
		}

		const image = { url: ImagesUtil.getRandomFrom(client, key, cache) || defaultImg };
		return new MessageEmbed({ image });
	}

	/**
	 * Get an array of the currently most popular images from a given subreddit.
	 * @param {string} subreddit - Subreddit to pull from
	 * @return {?string[]} - Array of images, if applicable
	 */
	static async getImages(subreddit) { // eslint-disable-line consistent-return
		try {
			const res = await request.get(`https://imgur.com/r/${subreddit}/hot.json`);
			return JSON.parse(res).data;
		} catch (err) {
			winston.warn(`[DISCORD]: GetImagesError >`, err);
		}
	}

	/**
	 * @param {CommandoClient} client - Commando client
	 * @param {string} subreddit - Subreddit to pull from
	 * @param {string[]} images - Array of images 
	 * @return {?string} - Random image, if applicable
	 */
	static getRandomFrom(client, key, images) {
		if (images.length === 0) {
			return;
		}

		const rand = Math.floor(Math.random() * images.length);
		const randImg = images[rand];

		if (!randImg.ext) {
			winston.warn(`[DISCORD]: GetRandomImageError >`, randImg);
			images.splice(rand, 1);
			client.redis.setAsync(key, JSON.stringify(images));
			return;
		}

		const extension = randImg.ext.replace(/\?.*/, '');
		return `http://i.imgur.com/${randImg.hash}${extension}`; // eslint-disable-line consistent-return
	}
};
