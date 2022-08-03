import * as dotenv from "dotenv";
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient, HelixEventSubSubscription, HelixPaginatedResultWithTotal } from '@twurple/api';
import { EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { getClient } from "./client";
import * as robot from "robotjs";

dotenv.config();

export const subscribeEvents = async() => {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.NGROK_SECRET) throw Error('何かが足りないです。');

    const clientId: string = process.env.CLIENT_ID;
    const clientSecret: string = process.env.CLIENT_SECRET;
    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
    const apiClient = new ApiClient({ authProvider });

    const listener = new EventSubListener({
        apiClient,
        adapter: new NgrokAdapter(),
        secret: process.env.NGROK_SECRET,
        strictHostCheck: true
    });
    const { chatClient } =  await getClient();
    const userId: string = '195327703';
    
    const getSubscriptions = async ():Promise<HelixPaginatedResultWithTotal<HelixEventSubSubscription>> => {
        return apiClient.eventSub.getSubscriptions();
    }
    
    const deleteAllSubscriptions = async ():Promise<void> => {
        apiClient.eventSub.deleteAllSubscriptions();
        console.log('deleted all subscriptions.')
    }
    
    const subscribeToChannelSubscribeEvents = async ():Promise<void> => {
        listener.subscribeToChannelSubscriptionEvents(userId, e=> {
            console.log(`${e.userName} just Tier${Number(e.tier)/1000} subscribed!`);
        })
    }

    const subscribeToChannelSubscriptionGiftEvents = async ():Promise<void> => {
        listener.subscribeToChannelSubscriptionGiftEvents(userId, e=> {
            if(e.isAnonymous) {
                console.log(`Anounimous just gifted ${e.amount} subs to the community!`);
            }
            console.log(`${e.gifterName} just gifted ${e.amount} subs to the community!`);
        })
    }

    const subscribeToChannelCheerEvents = async ():Promise<void> => {
        listener.subscribeToChannelCheerEvents(userId, e=> {
            console.log(`${e.bits} bits by ${e.userName}`);
        })
    }

    let ecstasyGauge: number = 0;
    let ecstacyTimer:NodeJS.Timer;
    const subscribeToChannelRedemptionAddEvents = async():Promise<void> => {
        listener.subscribeToChannelRedemptionAddEvents(userId, e => {
            console.log(`${e.redeemedAt}: ${e.userName} ${e.broadcasterName} ${e.rewardTitle}`);
            if(e.rewardTitle.match('kimoi')) {
                clearInterval(ecstacyTimer);
                ecstasyGauge += 10;
                chatClient.say('#tanenob', `たねのぶエクスタシーゲージ ${'█'.repeat(ecstasyGauge/10) + '░'.repeat(10 - (ecstasyGauge/10))} ${ecstasyGauge}%`);
                ecstacyTimer = setInterval(()=> {
                    if(ecstasyGauge >= 10) {
                        ecstasyGauge -= 10;
                        chatClient.say('#tanenob', `たねのぶエクスタシーゲージ ${'█'.repeat(ecstasyGauge/10) + '░'.repeat(10 - (ecstasyGauge/10))} ${ecstasyGauge}%`);
                    }
                }, 20000)
                if (ecstasyGauge === 100) {
                    console.log('ecstasy event');
                    ecstasyGauge = 0;
                }
            }

            if(e.rewardTitle.match('leaf gacha')) {
                const baldnessProbability = Math.floor(Math.random() * 100);
                if (baldnessProbability < 30) {
                    chatClient.say('#tanenob', `ハゲになります`);
                    robot.keyTap("f6", "shift");
                    setTimeout(()=>{
                        robot.keyTap("f1", "shift");
                        chatClient.say('#tanenob', "たねのぶは恥ずかしがって葉っぱをかぶりました。");
                    }, 600000)
                } else {
                    chatClient.say('#tanenob', `葉っぱをかぶります`);
                    robot.keyTap("f1", "shift");
                }
            }
        });
    }
    
    const subscribeToChannelFollowEvents = async():Promise<void> => {
        listener.subscribeToChannelFollowEvents(userId, e => {
            console.log(`${e.userDisplayName ? e.userDisplayName : e.userName}`);
        })
    }
    await deleteAllSubscriptions();
    await subscribeToChannelSubscribeEvents();
    await subscribeToChannelSubscriptionGiftEvents();
    await subscribeToChannelCheerEvents();
    await subscribeToChannelRedemptionAddEvents();
    await subscribeToChannelFollowEvents();
    const subscriptions = await getSubscriptions();
    console.log(subscriptions);
    listener.listen();
    console.log('listening...');
}