import axios from 'axios';


let emoteSet= new Set<string>();

const fetch = (url:string) => {
    return axios.get(url)
        .then(res => {
            if (url.includes('global') || url.includes("frankerfacez")) {
                res.data.forEach((emote:any) => {
                    emoteSet.add(emote.code);
                })
            } else {
                res.data.channelEmotes.forEach((emote:any) => {
                    emoteSet.add(emote.code);
                })
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

const bttv = async (userId:number) => {
    await getAllEmotes(userId);
    return emoteSet
}

export { bttv };
//bttv(195327703);