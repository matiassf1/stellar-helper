import { StellarService } from ".";

export class SeedService {
    constructor(private stellarService: StellarService) { }

    private splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    public async createAccountSeed(usernames: string[]): Promise<void> {
        const CHUNK_SIZE = 30;
        const usernameChunks = this.splitArrayIntoChunks(usernames, CHUNK_SIZE);
        const accsToCreate: any[] = [];

        for (const chunk of usernameChunks) {
            const accountsInChunk = await this.stellarService.createAccountSeed(chunk);
            await this.stellarService.createTrustlinesInParallel(accountsInChunk);
            accsToCreate.push(...accountsInChunk);
        }

        console.log('All accounts created and trustlines established', accsToCreate);
    }

    public async resetDBWallets(usernames: string[], allUsers: any[]): Promise<void> {
        const CHUNK_SIZE = 30;
        const usernameChunks = this.splitArrayIntoChunks(usernames, CHUNK_SIZE);
        const accsToCreate: any[] = [];

        for (const chunk of usernameChunks) {
            const accountsInChunk = await this.stellarService.createAccountSeed(chunk);
            await this.stellarService.createTrustlinesInParallel(accountsInChunk);
            accsToCreate.push(...accountsInChunk);
        }

        for (const account of accsToCreate) {
            const user = allUsers.find((u) => u.username === account.username);
            if (user) {
                user.publicKey = account.publicKey;
                user.privateKey = account.privateKey;
            }
        }

        console.log('All wallets updated and persisted', accsToCreate);
    }
}
