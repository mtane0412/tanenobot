import { ApiClient } from '@twurple/api';
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { dictionary } from "./dictionary";
import { userInfo } from "./@types/index";

export const command = async (msg:TwitchPrivateMessage, message:string, userList:Array<userInfo>, apiClient:ApiClient) => {
    const result: string[] = message.split(' ');
    const cmd:string = result[0]; // ここに !cmd が入るよ
    const username = msg.userInfo.userName;
    const displayName = msg.userInfo.displayName;
    let response;

    if (cmd === '!hello') {
    if (result.length === 1) {
        response = `hello ${username}`;
    } else {
        // テスト用
        result.shift(); // 先頭の !command を削除
        const text = result.join(' ');
        response = `@${username} ${text}`;
    }
    }

    if(cmd === '!d' && result.length > 1) {
    const query = result[1];
    const dictResult = await dictionary(query);
    // 500文字以上ならカットして返す
    response = dictResult.length > 500 ? dictResult.substring(0, 498) + '……' : dictResult;
    }

    if(cmd === '!discord') {
    response =  `Discordサーバーでぜひお話しましょう！ Why not join our discord server? Let's enjoy talking with us! https://discord.gg/F76ervs3sw`
    }

    if(cmd === '!collab') {
    response = `今日はSquishyWishyBooと日本語のお勉強をしています。毎日ゲームやArtや歌配信をしています。日本語もすごく上手なのでぜひチェックしてください！ https://www.twitch.tv/squishywishyboo`
    }

    if(cmd === '!lurk') {
    let lurker = username;
    if (displayName) {
        lurker = displayName;
    }
    response = `/me FeelsStrongMan Thank you for the lurk! ${lurker} is now lurking, they will be missed! peepoLove`
    }

    if(cmd === '!inoran') {
    response = `このかわいいドラゴンの体を作ったのはイノラン博士です。あなたも人間をやめよう！ It was Dr. Inoran who created this cute little dragon body. You should stop being human too!  https://www.twitch.tv/doctor_inoran https://twitter.com/doctor_inoran`
    }

    if (cmd === '!shuzo') {
    response = `諦めちゃダメだ！ https://www.shuzo.co.jp/message/`;
    }

    if (cmd === '!github') {
    response = `https://github.com/mtane0412/tanenobot`;
    }

    if(cmd === '!so') {
    // @マークがついていたら除外する
    let soUser:string = result[1].replace('@', '').toLowerCase();
    const user:userInfo|undefined = userList.find((user: userInfo)=>user.displayName.toLowerCase() === soUser || user.username.toLowerCase() === soUser);
    // shoutoutのユーザーが存在しなければ終了
    if (!user) return
    const userId:string = user.userId;
    const channelInfo = await apiClient.channels.getChannelInfoById(userId);
    if (channelInfo) {
        const gameName = channelInfo.gameName;
        const title = channelInfo.title;
        response = await `この素晴らしい配信者をチェックしてください！ https://www.twitch.tv/${user.username} 最後の配信は ${gameName} 「${title}」みたいですよ！`;
    } else {
        return
    }
    }

    // お兄ちゃんへの返事を言うよ！
    if (response) {
    return response
    } else {
    console.error(`${cmd}は登録されてないよ`);
    return 
    }
}