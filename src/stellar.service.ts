import { Keypair, Asset, Networks, BASE_FEE, TransactionBuilder, Operation, Server } from 'stellar-sdk';

export class StellarService {
    private client: Server;
    private issuerKeypair: Keypair;
    private networkPassphrase: Networks;
    private referenceAsset: Asset;

    constructor(networkUrl: string, issuerSecret: string, assetCode: string, networkPassphrase: string) {
        this.client = new Server(networkUrl);
        this.issuerKeypair = Keypair.fromSecret(issuerSecret);
        this.networkPassphrase = networkPassphrase as Networks;
        this.referenceAsset = new Asset(assetCode, this.issuerKeypair.publicKey());
    }

    public async createAccountSeed(usernames: string[]): Promise<any[]> {
        const accounts: any[] = [];
        for (const username of usernames) {
            const keypair = Keypair.random();
            const startingBalance = "2"; // Set starting balance for the new account
            await this.createStellarAccount(keypair, startingBalance);
            accounts.push({
                username,
                publicKey: keypair.publicKey(),
                privateKey: keypair.secret()
            });
        }
        return accounts;
    }

    private async createStellarAccount(keypair: Keypair, startingBalance: string): Promise<void> {
        const account = await this.client.loadAccount(this.issuerKeypair.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: this.networkPassphrase
        })
            .addOperation(Operation.createAccount({
                destination: keypair.publicKey(),
                startingBalance
            }))
            .setTimeout(180)
            .build();

        transaction.sign(this.issuerKeypair);
        await this.client.submitTransaction(transaction);
    }

    public async createTrustlinesInParallel(accounts: any[]): Promise<void> {
        const promises = accounts.map(account =>
            this.createTrustline(account.publicKey, Keypair.fromSecret(account.privateKey))
        );
        await Promise.all(promises);
    }

    private async createTrustline(accountPublicKey: string, accountKeyPair: Keypair): Promise<void> {
        const account = await this.client.loadAccount(accountPublicKey);

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        })
            .addOperation(
                Operation.changeTrust({
                    asset: this.referenceAsset,
                })
            )
            .setTimeout(180)
            .build();

        transaction.sign(accountKeyPair);
        await this.client.submitTransaction(transaction);
    }
}
