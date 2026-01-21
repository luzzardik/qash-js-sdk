// Types
export enum QashAPIEnv { PRODUCTION = "https://api.qash.cloud", STAGING = "https://api.staging.qash.cloud", DEV = "https://api.dev.qash.cloud" };
export type Partner = {
    _id: string;
    name: string;
    juridisctions: string[];
    currencies: string[];
    routing: {
        identifier: string;
    } | null;
    is_cbs_partner: boolean;
    joined_at: number;
    revoked_at: number | null;
    logo_url: string | null;
}
export type IndividualAccountHolderCreationData = {
    name: string;
    discord_id: string | null;
    minecraft_id: string | null;
    external_id: string | null;
}
export type BaseAccountHolder = {
    _id: string;
    type: "individual" | "business" | "institution";
    responsible_partner: string;
    name: string;
    created_at: number;
    updated_at: number | null;
    revoked_at: number | null;
}
export type IndividualAccountHolder = BaseAccountHolder & {
    discord_id: string | null;
    minecraft_id: string | null;
    external_id: string | null;
}
export type AccountHolder = IndividualAccountHolder;
// SDK
export default class QashSDK {
    // Identification
    apiKey : string;
    environment : QashAPIEnv;
    constructor (apiKey : string, environment : QashAPIEnv = QashAPIEnv.PRODUCTION) {
        this.apiKey = apiKey;
        this.environment = environment;
        this.CBS = new QashCBS(this);
    }

    // Get authorized partner
    getAuthorizedPartner () : Promise<Partner> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.environment}/v1/partner/@self`, { headers: { Authorization: `Basic ${this.apiKey}` } }).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }

    // CBS
    public CBS;
}

// CBS
class QashCBS {
    #sdk: QashSDK;

    constructor (sdk: QashSDK) {
        this.#sdk = sdk;
    }

    // Get account holders
    // TODO: search query
    getAccountHolders () : Promise<AccountHolder[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/v1/cbs/account-holders`, { headers: { Authorization: `Basic ${this.#sdk.apiKey}` } }).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }

    // Get accounts
    // TODO: Account type
    // TODO: search query
    getAccounts () : Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/v1/cbs/accounts`, { headers: { Authorization: `Basic ${this.#sdk.apiKey}` } }).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }

    // Create account holder - Individual
    createIndividualAccountHolder (data: IndividualAccountHolderCreationData) : Promise<AccountHolder> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/v1/cbs/account-holders`, { method: "POST", body: JSON.stringify(Object.assign({ type: "individual" }, data)), headers: { Authorization: `Basic ${this.#sdk.apiKey}` } }).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }
}