require('dotenv').config();
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
    console.log(channel);
    console.log(tags);
    console.log(message);
    console.log(self);
	if(self) return; // ignore mesasges from tanenobot
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
	if(message.toLowerCase() === '!discord') {
		client.say(channel, `Discordサーバーでぜひお話しましょう！ Why not join our discord server? Let's enjoy talking with us! https://discord.gg/F76ervs3sw`);
	}
});