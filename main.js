"use strict";
require('dotenv').config();
const command = require("./command");
const doorbellPlay = require("./doorbellPlay");
const fs = require('fs').promises;
const { ChatClient } =  require('@twurple/chat');
const { RefreshingAuthProvider } = require('@twurple/auth');

async function main() {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'UTF-8'));
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
        },
        tokenData
    );
    const chatClient = new ChatClient({ authProvider, channels: ['tanenob'] });
    await chatClient.connect();

    const storage = {
        lobbyInfo: "",
        chatUsers: new Set()
    };

    chatClient.onMessage((channel, user, message, msg) => {
        const displayName = msg.userInfo.displayName;
        console.log(`[${channel}] ${user}: ${message}`);
        if (!storage.chatUsers.has(user)) {
            storage.chatUsers.add(user);
            doorbellPlay(user);
        }
        if (message === '!ping') {
            chatClient.say(channel, 'Pong!');
        } else if (message === '!dice') {
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            chatClient.say(channel, `@${user} rolled a ${diceRoll}`)
        }
        if(message.startsWith('!')) {
            const response = command(msg, message, storage);
            if (response){
                // お兄ちゃんに何か返すときだけ、返信しちゃお！
                chatClient.say(channel, response);
            }
        } else {
            return
        }
    });

    chatClient.onSub((channel, user) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });
}

main();