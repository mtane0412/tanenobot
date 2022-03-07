"use strict";
require('dotenv').config();
const bttv = require("./bttv");
const command = require("./command");
const doorbellPlay = require("./doorbellPlay");
const {exclude, deepl} = require("./deepl");
const fs = require('fs').promises;
const { ApiClient } =  require('@twurple/api');
const { ChatClient } =  require('@twurple/chat');
const { RefreshingAuthProvider } = require('@twurple/auth');
const ignoreUsers = ['Nightbot', 'StreamElements', 'Streamlabs', 'tanenobot'];
const bouyomiConnect = require('./bouyomi');
const bouyomiServer = {
    host: '127.0.0.1',
    port: '50001'
};

const main = async()=> {
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
    const apiClient = new ApiClient({ authProvider });
    const chatClient = new ChatClient({ authProvider, channels: ['tanenob'] });
    await chatClient.connect();

    const storage = {
        enableTranslate: false,
        lobbyInfo: "",
        streamInfo: new Map(),
        userInfo: new Map(),
        nameTable: new Map(),
        addUserInfo(userId, username, displayName) {
            this.nameTable.set(displayName, username);
            this.userInfo.set(username,
                {
                    userId: userId,
                    username: username,
                    displayName: displayName,
                    translationCoolTime: 0
                })
        },
        addtranslationCoolTime(username) {
            if (!this.streamInfo.get('translationCoolTime')) this.streamInfo.set('translationCoolTime', 6000);
            this.userInfo.get(username).translationCoolTime = this.streamInfo.get('translationCoolTime');
            setTimeout(()=> {
                this.userInfo.get(username).translationCoolTime = 0; 
            }, this.streamInfo.get('translationCoolTime'))
        }
    };

    const bttvEmotes = await bttv(195327703);

    chatClient.onMessage(async (channel, user, message, msg) => {
        const chatter = msg.userInfo.displayName === user ? user : `${msg.userInfo.displayName}(${user})`;
        console.log(`[${channel}] ${chatter}: ${message}`);
        if (!storage.userInfo.has(user)) {
            storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
            doorbellPlay(user);
        } 

        // Cheer処理
        if(msg.isCheer) {
            return chatClient.say(channel, `Thanks for the ${msg.bits} bits!! ${chatter}`)
        }

        // !command処理
        if(message.startsWith('!')) {
            const response = await command(msg, message, storage, apiClient);
            if (response){
                // お兄ちゃんに何か返すときだけ、返信しちゃお！
                return chatClient.say(channel, response);
            } else {
                return
            }
        }

        // テキストのみを抽出
        let textsWithoutEmotes = "";
        msg.parseEmotes().forEach(obj => {
            if (obj.type === 'text') {
                textsWithoutEmotes += obj.text;
            }
        });

        bttvEmotes.forEach(emote=> {
            textsWithoutEmotes = textsWithoutEmotes.replace(emote, "");
        })

        bouyomiConnect.sendBouyomi(bouyomiServer, textsWithoutEmotes);

        if (!ignoreUsers.includes(user) && storage.enableTranslate && !storage.userInfo.get(user).translationCoolTime) {


            // 除外判定に引っかかったら翻訳しない
            if (exclude(textsWithoutEmotes)) return

            // DeepL翻訳
            deepl(textsWithoutEmotes).then(result => {
                console.log(result);
                chatClient.say(channel, `${result.data.translations[0].text} [by ${user}]`);
            }).catch(error => {
                console.error(error)
                return null
            });
            storage.addtranslationCoolTime(user);
        }
    });

    chatClient.onSub((channel, user, subInfo, msg) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel, user, subInfo, msg) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel, user, subInfo, msg) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });


    chatClient.onRaid(async (channel, user, raidInfo, msg) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        const raider = raidInfo.displayName ? `${raidInfo.displayName}(${user})` : user;
        // 直前の配信情報取得
        const channelInfo = await apiClient.channels.getChannelInfo(storage.userInfo.get(user).userId);
        const gameName = await channelInfo.gameName;
        const title = await channelInfo.title;
        chatClient.say(channel, `we got raid by ${raider} with ${raidInfo.viewerCount} viewers! Please check their stream https://www.twitch.tv/${user} 最後の配信は ${gameName} 「${title}」みたいですよ！`);
    });

    chatClient.onHosted((channel, byChannel, auto, viewers) => {
        if (!auto){
            chatClient.say(channel, `we got hosted by ${byChannel} with ${viewers} viewers`);
        }
    });

}

main();