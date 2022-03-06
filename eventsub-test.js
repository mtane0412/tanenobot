"use strict";
require('dotenv').config();
const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const { ApiClient, HelixEventSubApi } = require('@twurple/api');
const { EventSubListener } = require('@twurple/eventsub');
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });
const { NgrokAdapter } = require('@twurple/eventsub-ngrok');
const helixEvent = new HelixEventSubApi(apiClient);

const listener = new EventSubListener({
	apiClient,
	adapter: new NgrokAdapter(),
	secret: process.env.NGROK_SECRET
});

const userId = '195327703';
/*
const onlineSubscription = await listener.subscribeToStreamOnlineEvents(userId, e => {
    console.log(`${e.broadcasterDisplayName} just went live!`);
});

const offlineSubscription = await listener.subscribeToStreamOfflineEvents(userId, e => {
    console.log(`${e.broadcasterDisplayName} just went offline`);
});
*/


(async () => {
    helixEvent.getSubscriptions().then(res=>console.log(res));
    /*
    console.log(`チャンネルポイントを掴む`)
    await listener.subscribeToChannelRedemptionAddEvents(userId, async e => {
        console.log(`${e.redeemedAt}: ${e.userName} ${e.broadcasterName} ${e.rewardTitle}`);
    });
    listener.listen();
    */
})();

process.on("SIGINT", (signal) => {
    console.log(`Process ${process.pid} has been interrupted`);
    listener.unlisten().then;
    process.exit(0);
});