"use strict";
require('dotenv').config();
const fs = require('fs').promises;
const { PubSubClient } = require('@twurple/pubsub');
const { RefreshingAuthProvider } = require('@twurple/auth');
const pubSubClient = new PubSubClient();


const main = async () => {
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
    const userId = await pubSubClient.registerUserListener(authProvider);
    /*
    const listener = await pubSubClient.onRedemption(userId, (message) => {
        console.log(`${message.redemptionDate} ${message.userDisplayName}が${message.rewardTitle}を引き換えました！`)
    });
    */
    const listener = await pubSubClient.getUserListener(userId);
    listener.removeListener(userId);
}

main();