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
        userInfo: new Map(),
        addUserInfo(username, displayName) {
            this.userInfo.set(username,
                {
                    username: username,
                    displayName: displayName,
                    url: `https://www.twitch.tv/${username}`
                })
        }
    };

    chatClient.onMessage((channel, user, message, msg) => {
        const chatter = msg.userInfo.displayName ? `${msg.userInfo.displayName}(${user})` : user;
        console.log(`[${channel}] ${chatter}: ${message}`);
        if (!storage.userInfo.has(user)) {
            storage.addUserInfo(user, msg.userInfo.displayName);
            doorbellPlay(user);
        } 

        // Cheer処理
        if(msg.isCheer) {
            chatClient.say(channel, `Thanks for the ${msg.bits} bits!! ${chatter}`)
        }

        // !command処理
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

    chatClient.onSub((channel, user, subInfo, msg) => {
        storage.addUserInfo(user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel, user, subInfo, msg) => {
        storage.addUserInfo(user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel, user, subInfo, msg) => {
        storage.addUserInfo(user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });


    chatClient.onRaid((channel, user, raidInfo, msg) => {
        storage.addUserInfo(user, msg.userInfo.displayName);
        const raider = raidInfo.displayName ? `${raidInfo.displayName}(${user})` : user;
        chatClient.say(channel, `we got raid by ${raider} with ${raidInfo.viewerCount} viewers`);
    });

    chatClient.onHosted((channel, byChannel, auto, viewers) => {
        if (!auto){
            chatClient.say(channel, `we got hosted by ${byChannel} with ${viewers} viewers`);
        }
    });

}

main();