import * as dotenv from "dotenv";
import { ApiClient } from '@twurple/api';
import { AccessToken } from "@twurple/auth/lib";
import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider, ClientCredentialsAuthProvider } from '@twurple/auth';
import { promises as fs } from "fs";


dotenv.config();

let apiClient:ApiClient|undefined;
let chatClient:ChatClient|undefined;
let apiClientForEventsub:ApiClient|undefined;

export const getClient = async() => {
    if (typeof apiClient !== 'undefined' && typeof chatClient !== 'undefined' && typeof apiClientForEventsub !== 'undefined') {
        // すでにインスタンスがある場合はそれを返す
        return {apiClient, apiClientForEventsub, chatClient}
    }

    // インスタンスを作成

    const clientId: string | undefined = process.env.CLIENT_ID;
    const clientSecret: string | undefined = process.env.CLIENT_SECRET;
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf8'));
    if (!clientId || !clientSecret) {
        throw Error('client_id, client_secretが正しくないですよ！');
    }
    const authProvider:RefreshingAuthProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async (newTokenData:AccessToken):Promise<void> => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8')
        },
        tokenData
    );
    
    apiClient = new ApiClient({ authProvider });
    chatClient = new ChatClient({ authProvider, channels: ['tanenob'] });

    const authProviderForEventsub:ClientCredentialsAuthProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
    apiClientForEventsub = new ApiClient({ authProvider: authProviderForEventsub });
    
    await chatClient.connect();
    return { apiClient, apiClientForEventsub, chatClient }
}
