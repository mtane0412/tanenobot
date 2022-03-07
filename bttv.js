"use strict";
const axios = require('axios');

const bttv = (userId) => {
    const globalUrl = 'https://api.betterttv.net/3/cached/emotes/global';
    const bttvChannelEmotes = `https://api.betterttv.net/3/cached/users/twitch/${userId}`;
    const ffzChannelEmotes = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${userId}`;
    axios.get(bttvChannelEmotes)
        .then(res => {
            console.log(res.data);
        })
        .catch(error => console.log(error))
        .then(()=> console.log('end'));
}

bttv(195327703);