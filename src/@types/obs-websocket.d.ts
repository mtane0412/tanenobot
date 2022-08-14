export type SceneItem = {
    inputKind: string|null,no
    isGroup: boolean|null,
    sceneItemBlendMode: string,
    sceneItemEnabled: boolean,
    sceneItemId: number,
    sceneItemIndex: number,
    sceneItemLocked: false,
    sceneItemTransform: {
    alignment: number,
    boundsAlignment: number,
    boundsHeight: number,
    boundsType: string,
    boundsWidth: number,
    cropBottom: number,
    cropLeft: number,
    cropRight: number,
    cropTop: number,
    height: number,
    positionX: number,
    positionY: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    sourceHeight: number,
    sourceWidth: number,
    width: number
    },
    sourceName: string,
    sourceType: string
}

export type Triggers = Map<string,Trigger>;
export type Trigger = {
    sceneName: string;
    sourceName: string;
    duration: number|null;
}