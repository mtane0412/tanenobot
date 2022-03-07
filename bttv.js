"use strict";
const axios = require('axios');

const fetch = (url) => {
    const emoteList = [];
    return axios.get(url)
        .then(res => {
            if (url.includes('global')) {
                res.data.forEach(emote => {
                    emoteList.push(emote.code);
                })
            } else if (url.includes('frankerfacez')) {
                emoteList.push(res.data.code);
            } else {
                res.data.channelEmotes.forEach(emote => {
                    emoteList.push(emote.code);
                })
                res.data.sharedEmotes.forEach(emote => {
                    emoteList.push(emote.code);
                })
            }
        })
        .catch(error => console.log(error))
        .then(() => { return emoteList })
}

const getAllEmotes = (userId) => {
    const bttvGlobalEmotes = `https://api.betterttv.net/3/cached/emotes/global`;
    const bttvChannelEmotes = `https://api.betterttv.net/3/cached/users/twitch/${userId}`;
    const ffzChannelEmotes = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${userId}`;
    return Promise.all([fetch(bttvGlobalEmotes), fetch(bttvChannelEmotes), fetch(ffzChannelEmotes)])
}


const bttv = async (userId) => {
    const emoteLists = await getAllEmotes(userId);
    const emoteList = emoteLists.flat();
    return emoteList
}

module.exports = bttv;