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
    metadata: Record<string, any> | string | null;
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
export type AccountListQuery = {
    partner?: string | string[];
    type?: string | string[];
    holder?: string | string[];
    currency?: string | string[];
}
export type CurrencyExchangeRate = {
    currency: string;
    rate: number;
}
export type CurrencySymbol = {
    value: string;
    is_after: boolean;
}
export type Currency = {
    _id: string;
    code: string;
    name: string;
    symbol: CurrencySymbol;
    exchange_rates: CurrencyExchangeRate[];
}
// Util: build query value
function buildQueryValue (value: string | string[]) {
    return Array.isArray(value) ? value.join(',') : value;
}
// Util: build query
function buildQuery (query: Record<string, string | string[]>) {
    if (Object.keys(query).length == 0) return "";
    const kV : Record<string, string> = {};
    for (let i in query) {
        if (typeof query[i] !== "string" && !Array.isArray(query[i])) continue;
        if (Array.isArray(query[i])) query[i] = (query[i] as string[]).filter((f: any) => typeof f === "string");
        kV[i] = buildQueryValue(query[i]);
    }
    const built = Object.entries(kV).map(([k, v]) => `${k}=${v}`).join('&');
    return '?' + built;
}
// SDK
export default class QashSDK {
    // Identification
    apiKey : string;
    environment : QashAPIEnv;
    constructor (apiKey : string, environment : QashAPIEnv = QashAPIEnv.PRODUCTION) {
        this.apiKey = apiKey;
        this.environment = environment;
        this.CBS = new QashCBS(this);
        this.Datasets = new QashDatasets(this);
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

    // Subsets
    public CBS;
    public Datasets;
}

// Datasets
class QashDatasets {
    #sdk: QashSDK;

    constructor (sdk: QashSDK) {
        this.#sdk = sdk;
    }

    // Get currencies
    getCurrencies () : Promise<Currency[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/datasets/currencies`).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }

    // Get currency
    getCurrency (currency_id: string) : Promise<Currency> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/datasets/currency/${currency_id}`).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }
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
    getAccounts (query: AccountListQuery = {}) : Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            const builtQuery = buildQuery(query);
            try {
                let _q = await fetch(`${this.#sdk.environment}/v1/cbs/accounts${builtQuery}`, { headers: { Authorization: `Basic ${this.#sdk.apiKey}` } }).then(r => r.json());
                if (_q.error || _q.errors) throw _q.errors || [_q.error];
                return resolve(_q);
            } catch (e) {
                reject(Array.isArray(e) ? e : ["unexpected_issue"]);
            }
        });
    }

    // Get account holder
    getAccountHolder (account_holder_id: string) : Promise<AccountHolder> {
        return new Promise(async (resolve, reject) => {
            try {
                let _q = await fetch(`${this.#sdk.environment}/v1/cbs/account-holder/${account_holder_id}`, { headers: { Authorization: `Basic ${this.#sdk.apiKey}` } }).then(r => r.json());
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