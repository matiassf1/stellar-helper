export class CreateStellarAccountException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CreateStellarAccountException';
    }
}

export const StellarExceptionMessages = {
    CREATE_ACCOUNT_EXCEPTION: 'Error creating Stellar account',
    TRUSTLINE_EXCEPTION: 'Error creating Stellar trustline',
};
