"use strict";
require('dotenv').config();
const command = require("./command");

const tmi = require('tmi.js');
const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'tanenobot',
		password: process.env.TWITCH_TOKEN
	},
	channels: [ 'tanenob' ]
});
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
	if(self) return; // ignore mesasges from tanenobot


	if(message.startsWith('!')) {
		const reply = command(tags, message);
		if (reply){
			// お兄ちゃんに何か返すときだけ、返信しちゃお！
			client.say(channel, reply);
		}
	}
});