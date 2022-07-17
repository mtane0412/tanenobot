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
import { subscribeEvents } from "./eventsub";

const config = toml.parse(fs.readFileSync('./config.toml', 'utf8'));
const ignoreUsers: string[] = config.ignore_users;
const translationEnabled = config.translation_enabled;

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
    await subscribeEvents();
    console.log('tanenobot connected');
    chatClient.say('#tanenob', `tanenobot connected`);

    // logファイル作成
    const today = new Date();
    const logFilePath = 'log/' + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + '.txt';
    if(!fs.existsSync(logFilePath)) {
        fs.writeFile(logFilePath, '', (err) => {
            if (err) { throw err; }
            console.log('logを作成したよ！');
        });
    }

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
        if(ignoreUsers.includes(user)) {
            return
        }

        // Cheer処理
        if(msg.isCheer) {
            fs.appendFile(logFilePath, `Cheer: ${user}, ${msg.bits} bits, https://www.twitch.tv/${user} \n`, (err)=> {
                if (err) { throw err; }
                console.log('cheer情報を保存しました');
            });
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
        bouyomiConnect(name + ' ' + message);

        if (translationEnabled) {
            // DeepL翻訳
            const result = await deepl(sanitizedMessage);
            if (result) chatClient.say(channel, `${result} [by ${user}]`);
        }
    });

    chatClient.onSub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
        fs.appendFile(logFilePath, `SubScribe: ${user} \n`, (err)=> {
            if (err) { throw err; }
            console.log('Sub情報を保存しました');
        });
    });
    
    chatClient.onResub((channel:string, user:string, subInfo:ChatSubInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
        fs.appendFile(logFilePath, `ReSub: ${user} \n`, (err)=> {
            if (err) { throw err; }
            console.log('Resub情報を保存しました');
        });
    });
    
    chatClient.onSubGift((channel:string, user:string, subInfo:ChatSubGiftInfo, msg:UserNotice) => {
        addUserInfo(msg.userInfo.userId, user, msg.userInfo.displayName, msg.date);
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
        fs.appendFile(logFilePath, `SubGift: ${subInfo.gifter} もらった人(${user}) \n`, (err)=> {
            if (err) { throw err; }
            console.log('SubGift情報を保存しました');
        });
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
        fs.appendFile(logFilePath, `Raid: ${user}, https://www.twitch.tv/${user} \n`, (err)=> {
            if (err) { throw err; }
            console.log('Raid情報を保存しました');
        });
    });

    chatClient.onHosted((channel: string, byChannel: string, auto: boolean, viewers: number|undefined) => {
        if (!auto) chatClient.say(channel, `we got hosted by ${byChannel} with ${viewers} viewers`);
    });

}

main();