import OBSWebSocket, {OBSEventTypes, OBSRequestTypes, OBSResponseTypes} from 'obs-websocket-js';
import * as dotenv from "dotenv";
import { setTimeout as sleep} from "timers/promises";
import { SceneItem, Trigger } from './@types/obs-websocket';
dotenv.config();

const obs:OBSWebSocket = new OBSWebSocket();

const connectOBS = async () => {
    await obs.connect('ws://127.0.0.1:4444', process.env.OBS_WEBSOCKET_PASSWORD)
    .then(async () => {
        console.log(`Success! We're connected & authenticated.`);
    })
    .catch(err => console.error(err));
};

const disconnectOBS = async () => {
    await obs.disconnect().then(async () => {
        console.log(`disconnected`);
    })
    .catch(err => console.error(err));
}


const tanenobFyre = async (trigger:Trigger) => {
    const { sceneName, sourceName, duration } = trigger;
    const sceneItemList:OBSResponseTypes['GetSceneItemList'] = await obs.call('GetSceneItemList', {sceneName});
    const sceneItem = sceneItemList.sceneItems.find(item=>item.sourceName === sourceName) as SceneItem;
    const sceneItemId:number|undefined = sceneItem?.sceneItemId;
    if(sceneItemId) {
        await obs.call('SetSceneItemEnabled', {sceneName, sceneItemId, sceneItemEnabled: true});
        if (duration) {
            await sleep(duration);
            await obs.call('SetSceneItemEnabled', {sceneName, sceneItemId, sceneItemEnabled: false});
        }
    }
}

const setSceneDisabled = async (trigger:Trigger) => {
    const { sceneName, sourceName } = trigger;
    const sceneItemList:OBSResponseTypes['GetSceneItemList'] = await obs.call('GetSceneItemList', {sceneName});
    const sceneItem = sceneItemList.sceneItems.find(item=>item.sourceName === sourceName) as SceneItem;
    const sceneItemId:number|undefined = sceneItem?.sceneItemId;
    if(sceneItemId) {
        await obs.call('SetSceneItemEnabled', {sceneName, sceneItemId, sceneItemEnabled: false});
    }
}

obs.on('ConnectionClosed', () => {
    console.log('connection closed. reconnecting...');
	connectOBS();
});

export {connectOBS, disconnectOBS, tanenobFyre, setSceneDisabled}