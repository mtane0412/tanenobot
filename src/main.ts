import { ChatSubGiftInfo } from "@twurple/chat/lib";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { ChatSubInfo, UserNotice, ChatRaidInfo } from '@twurple/chat';
import { bttv } from './bttv';
import { doorbellPlay } from "./player";
import { deepl } from "./deepl";
import { getClient } from "./client";
import { command } from "./command"
import { bouyomiConnect } from "./bouyomi"
import { sanitize } from "./sanitize"
import * as toml from 'toml';
import * as fs from 'fs';
import { userInfo } from "./@types/index";

const config = toml.parse(fs.readFileSync('./config.toml', 'utf8'));
const ignoreUsers: string[] = config.ignore_users;
const translation = config.translation;

const userList:Array<userInfo> = [];
const addUserInfo = (userId: string, username: string, displayName: string, lastMessageDate: Date): void => {
    const userIndex:number = userList.findIndex(user=>user.userId === userId);
    const payload = {
        userId: userId,
        username: username,
        displayName: displayName,
        lastMessageDate: lastMessageDate
    };
    if (userIndex === -1) {
        // 新規チャットユーザーの場合、ユーザー情報を追加
        userList.push(payload);
    } else {
        // 既存のチャットユーザーの場合、ユーザー情報を更新
        userList[userIndex] = payload;
    }
}

export const main = async()=> {
    const streamStartDate = new Date();
    const { apiClient, chatClient } =  await getClient();
    await chatClient.connect();

    const bttvEmotes: Set<string> = await bttv(195327703);

    chatClient.onMessage(async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
        const chatter = msg.userInfo.displayName === user ? user : `${msg.userInfo.displayName}(${user})`;
        console.log(`[${channel}] ${chatter}: ${message}`);
        const userIndex:number = userList.findIndex(user=>user.userId === msg.userInfo.userId);
        const firstChat:boolean = userIndex > -1 ? userList[userIndex].lastMessageDate.getTime() - streamStartDate.getTime() < 0 : true;
        if (userIndex === -1 && firstChat) {
            // 新規チャットの場合、もしくは最初のチャットの場合
            doorbellPlay(user);
        }

        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        console.log(userList);
        if(ignoreUsers.includes(user)) {
            return
        }

        // Cheer処理
        if(msg.isCheer) {
            return chatClient.say(channel, `Thanks for the ${msg.bits} bits!! ${chatter}`)
        }

        // !command処理
        if(message.startsWith('!')) {
            const response = await command(msg, message, userList, apiClient);
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

        if (translation) {
            // DeepL翻訳
            const result = await deepl(sanitizedMessage);
            if (result) chatClient.say(channel, `${result} [by ${user}]`);
        }
    });

    chatClient.onSub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel:string, user:string, subInfo:ChatSubGiftInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });


    chatClient.onRaid(async (channel:string, user:string, raidInfo: ChatRaidInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        const raider = raidInfo.displayName ? `${raidInfo.displayName}(${user})` : user;
        // 直前の配信情報取得
        const channelInfo = await apiClient.channels.getChannelInfoById(msg.userInfo.userId);
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