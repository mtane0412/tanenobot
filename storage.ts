
interface userInfo {
    userId: number,
    username: string,
    displayName: string,
    translationCoolTime: number|undefined
}

export class storage {
    enableTranslate: boolean;
    lobbyInfo: string;
    streamInfo: Map<string, number>;
    userInfo: Map<string, userInfo>;
    nameTable: Map<string, string>;
    addUserInfo(userId: number, username: string, displayName: string):void {
        this.nameTable.set(displayName, username);
        this.userInfo.set(username,
            {
                userId: userId,
                username: username,
                displayName: displayName,
                translationCoolTime: 0
            })
    };
    addtranslationCoolTime(username:string):void {
        if (!this.streamInfo.get('translationCoolTime')) this.streamInfo.set('translationCoolTime', 6000);
        this.userInfo.get(username)!.translationCoolTime = this.streamInfo.get('translationCoolTime');
        setTimeout(()=> {
            this.userInfo.get(username)!.translationCoolTime = 0; 
        }, this.streamInfo.get('translationCoolTime'))
    };
    constructor() {
        this.enableTranslate = false;
        this.lobbyInfo = "";
        this.streamInfo = new Map();
        this.userInfo = new Map();
        this.nameTable = new Map();
    }
}

/*
export const storage:storage = {
    enableTranslate: false,
    lobbyInfo: "",
    streamInfo: new Map(),
    userInfo: new Map(),
    nameTable: new Map(),
    addUserInfo(userId, username, displayName) {
        this.nameTable.set(displayName, username);
        this.userInfo.set(username,
            {
                userId: userId,
                username: username,
                displayName: displayName,
                translationCoolTime: 0
            })
    },
    addtranslationCoolTime(username) {
        if (!this.streamInfo.get('translationCoolTime')) this.streamInfo.set('translationCoolTime', 6000);
        this.userInfo.get(username).translationCoolTime = this.streamInfo.get('translationCoolTime');
        setTimeout(()=> {
            this.userInfo.get(username).translationCoolTime = 0; 
        }, this.streamInfo.get('translationCoolTime'))
    }
};
*/