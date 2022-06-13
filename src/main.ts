import * as dotenv from "dotenv";
import { ChatSubGiftInfo } from "@twurple/chat/lib";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { ChatSubInfo, UserNotice, ChatRaidInfo } from '@twurple/chat';
import { AxiosError, AxiosResponse } from 'axios';
import { bttv } from './bttv';
import { doorbellPlay } from "./player";
import { exclude, deepl } from "./deepl";
import { getClient } from "./client";
import { command } from "./command"
import { bouyomiConnect } from "./bouyomi"
import { sanitize } from "./sanitize"
import * as toml from 'toml';
import * as fs from 'fs';

const sample = fs.readFileSync('./sample.toml', 'utf8');
const data = toml.parse(sample);

dotenv.config();

const ignoreUsers: string[] = data.ignore_users;

export const main = async()=> {
    const { apiClient, chatClient } =  await getClient();
    await chatClient.connect();
    const storage = {
        enableTranslate: false,
        lobbyInfo: "",
        streamInfo: new Map(),
        userInfo: new Map(),
        nameTable: new Map(),
        addUserInfo(userId: string, username: string, displayName: string) {
            this.nameTable.set(displayName, username);
            this.userInfo.set(username,
                {
                    userId: userId,
                    username: username,
                    displayName: displayName,
                    translationCoolTime: 0
                })
        },
        addtranslationCoolTime(username: string) {
            if (!this.streamInfo.get('translationCoolTime')) this.streamInfo.set('translationCoolTime', 6000);
            this.userInfo.get(username).translationCoolTime = this.streamInfo.get('translationCoolTime');
            setTimeout(()=> {
                this.userInfo.get(username).translationCoolTime = 0; 
            }, this.streamInfo.get('translationCoolTime'))
        }
    };

    const bttvEmotes: Set<string> = await bttv(195327703);

    chatClient.onMessage(async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
        const chatter = msg.userInfo.displayName === user ? user : `${msg.userInfo.displayName}(${user})`;
        console.log(`[${channel}] ${chatter}: ${message}`);
        if (!storage.userInfo.has(user)) {
            storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
            doorbellPlay(user);
        }

        if(ignoreUsers.includes(user)) {
            return
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
        
        
        const sanitizedMessage = sanitize(msg, bttvEmotes);
        const name : string = msg.userInfo.displayName === 'Ribenchi' ? msg.userInfo.displayName + '様' : msg.userInfo.displayName;
        bouyomiConnect(name + ' ' + sanitizedMessage);
    


        if (storage.enableTranslate && !storage.userInfo.get(user).translationCoolTime) {
            // 除外判定に引っかかったら翻訳しない
            if (exclude(sanitizedMessage)) return

            // DeepL翻訳
            deepl(sanitizedMessage).then((result: AxiosResponse) => {
                chatClient.say(channel, `${result.data.translations[0].text} [by ${user}]`);
            }).catch((error: AxiosError) => {
                console.error(error)
                return null
            });
            storage.addtranslationCoolTime(user);
        }
    });

    chatClient.onSub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel:string, user:string, subInfo:ChatSubGiftInfo, msg:UserNotice) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });


    chatClient.onRaid(async (channel:string, user:string, raidInfo: ChatRaidInfo, msg:UserNotice) => {
        storage.addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName);
        const raider = raidInfo.displayName ? `${raidInfo.displayName}(${user})` : user;
        // 直前の配信情報取得
        const channelInfo = await apiClient.channels.getChannelInfo(storage.userInfo.get(user).userId);
        let lastStreamInfo: string = "";
        if (channelInfo) {
            lastStreamInfo = `最後の配信は ${channelInfo.gameName}「${channelInfo.title}」`;
        } else {
            console.error('channelInfoがありません');
        }
        chatClient.say(channel, `we got raid by ${raider} with ${raidInfo.viewerCount} viewers! Please check their stream https://www.twitch.tv/${user} ${lastStreamInfo}`);
    });

    chatClient.onHosted((channel: string, byChannel: string, auto: boolean, viewers: number|undefined) => {
        if (!auto) chatClient.say(channel, `we got hosted by ${byChannel} with ${viewers} viewers`);
    });

}

main();