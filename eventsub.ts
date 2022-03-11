import * as dotenv from "dotenv";
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient, HelixEventSubSubscription, HelixPaginatedResultWithTotal } from '@twurple/api';
import { EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
dotenv.config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.NGROK_SECRET) throw Error('何かが足りないです。');

const clientId: string = process.env.CLIENT_ID;
const clientSecret: string = process.env.CLIENT_SECRET;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const listener = new EventSubListener({
	apiClient,
	adapter: new NgrokAdapter(),
	secret: process.env.NGROK_SECRET
});

const userId: string = '195327703';

const getSubscriptions = ():Promise<HelixPaginatedResultWithTotal<HelixEventSubSubscription>> => {
    return apiClient.eventSub.getSubscriptions();
}

const deleteAllSubscriptions = async ():Promise<void> => {
    apiClient.eventSub.deleteAllSubscriptions();
    console.log('deleted all subscriptions.')
}

const subscribeToChannelCheerEvents = async ():Promise<void> => {
    listener.subscribeToChannelCheerEvents(userId, e=> {
        console.log(`${e.bits} bits by ${e.userName}`);
    })
}
const subscribeToChannelRedemptionAddEvents = async():Promise<void> => {
    listener.subscribeToChannelRedemptionAddEvents(userId, e => {
        console.log(`${e.redeemedAt}: ${e.userName} ${e.broadcasterName} ${e.rewardTitle}`);
    });
}

const subscribeToChannelFollowEvents = async():Promise<void> => {
    listener.subscribeToChannelFollowEvents(userId, e => {
        console.log(`${e.userDisplayName ? e.userDisplayName : e.userName}`);
    })
}

(async ():Promise<void> => {
    // 実行時にとにかくEventSub全部消す
    await deleteAllSubscriptions();
    // console.log()
    await subscribeToChannelCheerEvents();
    await subscribeToChannelRedemptionAddEvents();
    await subscribeToChannelFollowEvents();
    const subscriptions = await getSubscriptions();
    console.log(subscriptions);
    listener.listen();
    console.log('listening...');
})();