"use strict";
const axios = require('axios');

let emoteSet = new Set();

const fetch = (url) => {
    return axios.get(url)
        .then(res => {
            if (url.includes('global') || url.includes("frankerfacez")) {
                res.data.forEach(emote => {
                    emoteSet.add(emote.code);
                })
            } else {
                res.data.channelEmotes.forEach(emote => {
                    emoteSet.add(emote.code);
                })
                res.data.sharedEmotes.forEach(emote => {
                    emoteSet.add(emote.code);
                })
            }
        })
        .catch(error => console.log(error));
}

const getAllEmotes = (userId) => {
    const bttvGlobalEmotes = `https://api.betterttv.net/3/cached/emotes/global`;
    const bttvChannelEmotes = `https://api.betterttv.net/3/cached/users/twitch/${userId}`;
    const ffzChannelEmotes = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${userId}`;
    return Promise.all([fetch(bttvGlobalEmotes), fetch(bttvChannelEmotes), fetch(ffzChannelEmotes)])
}

const bttv = async (userId) => {
    await getAllEmotes(userId);
    return emoteSet
}

//bttv(195327703);
module.exports = bttv;