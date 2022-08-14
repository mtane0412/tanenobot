import * as dotenv from "dotenv";
import { HelixEventSubSubscription, HelixPaginatedResultWithTotal } from '@twurple/api';
import { EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { getClient } from "./client";
import * as robot from "robotjs";
import * as https from "https";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import { bouyomiConnect } from "./bouyomi"
import { play } from "./player";
import { setTimeout as sleep} from "timers/promises";

dotenv.config();
let ngrokAdapter:NgrokAdapter;
export const subscribeEvents = async():Promise<EventSubListener> => {
    if (!process.env.NGROK_SECRET) throw Error('ngrokのsecretがありません');
    if (typeof ngrokAdapter !== 'undefined') {
        console.log('kill ngrok...')
        console.log(await ngrokAdapter.getHostName());
        //ngrok.disconnect(await ngrokAdapter.getHostName());
        //await ngrok.connect();
    }
    const secret:string = (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
    console.log({secret});
    const { apiClientForEventsub, chatClient } =  await getClient();
    ngrokAdapter = new NgrokAdapter();
    console.log(await ngrokAdapter.getHostName());
    const listener:EventSubListener = new EventSubListener({
        apiClient: apiClientForEventsub,
        adapter: ngrokAdapter,
        secret: secret,
        strictHostCheck: true
    });
    
    const userId: string = '195327703';
    
    const getSubscriptions = async ():Promise<HelixPaginatedResultWithTotal<HelixEventSubSubscription>> => {
        return apiClientForEventsub.eventSub.getSubscriptions();
    }
    
    const deleteAllSubscriptions = async ():Promise<void> => {
        apiClientForEventsub.eventSub.deleteAllSubscriptions();
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

            if(e.rewardTitle.match('トークのお題！')) {
                const url = 'https://talkgacha.com/';
                https.get(url, res => {
                    let html = '';
                    res.on('data', line => html += line);
                    res.on('end', async () => {
                        const dom = new JSDOM(html);
                        const theme:string|undefined = dom.window.document.querySelector('.talk-theme-text')?.textContent?.replace(/\s/g, '');
                        if (typeof theme !== 'undefined') {
                            play('./public/sound/quiz.wav');
                            await sleep(2000);
                            chatClient.say('#tanenob', '【お題】'+ theme + '(提供: トークテーマガチャ https://talkgacha.com/)');
                            bouyomiConnect(theme);
                        }
                    });
        });
            }

            if(e.rewardTitle.match('leaf gacha')) {
                const baldnessProbability = Math.floor(Math.random() * 100);
                if (baldnessProbability < 30) {
                    chatClient.say('#tanenob', `ハゲになります`);
                    robot.keyTap("f6", ["control", "shift"]);
                    setTimeout(()=>{
                        robot.keyTap("f1", ["control", "shift"]);
                        chatClient.say('#tanenob', "たねのぶは恥ずかしがって葉っぱをかぶりました。");
                    }, 600000)
                } else {
                    chatClient.say('#tanenob', `葉っぱをかぶります`);
                    robot.keyTap("f1", ["control", "shift"]);
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
    console.log(subscriptions.total + 'subscriptions');
    await listener.listen();
    console.log('listening...');
    return listener
}