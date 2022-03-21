import * as dotenv from "dotenv";
import { ApiClient } from '@twurple/api';
import { AccessToken } from "@twurple/auth/lib";
import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from "fs";


dotenv.config();

export const getClient = async() => {
    const clientId: string | undefined = process.env.CLIENT_ID;
    const clientSecret: string | undefined = process.env.CLIENT_SECRET;
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf8'));
    if (!clientId || !clientSecret) {
        throw Error('client_id, client_secretが正しくないですよ！');
    }
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async (newTokenData:AccessToken):Promise<void> => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8')
        },
        tokenData
    );
    const apiClient = new ApiClient({ authProvider });
    const chatClient = new ChatClient({ authProvider, channels: ['tanenob'] });
    return { apiClient, chatClient }
}
