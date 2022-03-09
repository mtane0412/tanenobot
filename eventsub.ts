import * as dotenv from "dotenv";
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient, HelixEventSubApi } from '@twurple/api';
import { EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
dotenv.config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.NGROK_SECRET) throw Error('何かが足りないです。');

const clientId: string = process.env.CLIENT_ID;
const clientSecret: string = process.env.CLIENT_SECRET;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const helixEvent = new HelixEventSubApi(apiClient);

const listener = new EventSubListener({
	apiClient,
	adapter: new NgrokAdapter(),
	secret: process.env.NGROK_SECRET
});

const userId: string = '195327703';
/*
const onlineSubscription = await listener.subscribeToStreamOnlineEvents(userId, e => {
    console.log(`${e.broadcasterDisplayName} just went live!`);
});

const offlineSubscription = await listener.subscribeToStreamOfflineEvents(userId, e => {
    console.log(`${e.broadcasterDisplayName} just went offline`);
});
*/

const clearSubscriptions = ():void => {
    /* EventSubをすべてunsubscribeする */
    helixEvent.getSubscriptions().then(res=> {
        res.data.forEach((sub)=>{
            sub.unsubscribe();
            console.log(`${sub.id} is unsubscribed`);
        })
    });
}

const channelPointListen = () => {
    listener.subscribeToChannelRedemptionAddEvents(userId, e => {
        console.log(`${e.redeemedAt}: ${e.userName} ${e.broadcasterName} ${e.rewardTitle}`);
    });
}

const followerListen = () => {
    listener.subscribeToChannelFollowEvents(userId, e => {
        console.log(`${e.userDisplayName ? e.userDisplayName : e.userName}さん、フォローありがとうございます！ Thanks for the follow!`);
    })
}

(async () => {
    // 実行時にとにかくEventSub全部消す
    clearSubscriptions();
    helixEvent.getSubscriptions().then(res=> {
        if (res.total === 0) {
            channelPointListen();
            followerListen();
            listener.listen();
            console.log('listening...');
        }
    });
})();