import axios from 'axios';

let emoteSet= new Set<string>();

type emoteCode = {
    code: string
}

const fetch = (url:string) => {
    return axios.get(url)
        .then((res) => {
            if (url.includes('global') || url.includes("frankerfacez")) {
                // BTTV GlobalとFFZのエモートコードを追加
                res.data.forEach((emote:any) => {
                    emoteSet.add(emote.code);
                })
            } else {
                // BTTV Channel Emotesを追加
                res.data.channelEmotes.forEach((emote:any) => {
                    emoteSet.add(emote.code);
                })
                // BTTV Shared Emotesを追加
                res.data.sharedEmotes.forEach((emote:any) => {
                    emoteSet.add(emote.code);
                })
            }
        })
        .catch(error => console.log(error));
}

const getAllEmotes = (userId:number) => {
    const bttvGlobalEmotes = `https://api.betterttv.net/3/cached/emotes/global`;
    const bttvChannelEmotes = `https://api.betterttv.net/3/cached/users/twitch/${userId}`;
    const ffzChannelEmotes = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${userId}`;
    return Promise.all([fetch(bttvGlobalEmotes), fetch(bttvChannelEmotes), fetch(ffzChannelEmotes)])
}

export const bttv = async (userId:number) => {
    await getAllEmotes(userId);
    return emoteSet
}