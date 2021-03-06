import got from 'got';

type responsify<T> = T extends Object ? Promise<{ sku: string } & T> : never;

class SnapshotsTF {
    private readonly apiKey: string;
    //I currently don't know how site's ratelimit works so this might be wrong UwU
    private rateLimit: number[] = [];

    __rateHandler: NodeJS.Timeout;
    __rateNumber: number = 120;
    constructor(apiKey?: string) {
        this.apiKey = apiKey;
        this.__rateHandler = setInterval(() => {
            let i: number;
            const time = new Date().valueOf();
            for (i = 0; i < this.rateLimit.length; i++) {
                if (this.rateLimit[i] + 60000 > time) break;
            }
            this.rateLimit.splice(0, i);
        }, 100);
    }
    private async rate() {
        if (this.rateLimit.length < this.__rateNumber) this.rateLimit.push(new Date().valueOf());
        else
            throw {
                statusCode: null,
                message: 'This would exceed our rateLimit'
            };
        /*
        else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.rate((tries || 0) + 1);
        }
        */
    }
    private async request(url: string, type: 'get' | 'post' = 'get', needKey: boolean = false) {
        await this.rate();
        const req = got[type]('https://api.snapshots.tf/' + url, {
            headers: {
                accept: 'application/json',
                SNAPSHOT_KEY: needKey ? this.apiKey : ''
            }
        });
        try {
            return JSON.parse((await req).body);
        } catch (err) {
            throw JSON.parse(err.response.body);
        }
    }
    Stats() {
        return this.request('stats') as Promise<{
            listings: number;
            snapshots: number;
            users: number;
        }>;
    }
    Request(sku: string) {
        return this.request('request/' + sku, 'post', true); // as Promise<"bruh">
    }
    Overview() {
        return this.request('overview') as Promise<{
            items: string[];
            amount: number;
        }>;
    }

    Snapshots = {
        Get: (sku: string, max?: number) => {
            return this.request(
                `snapshots/sku/${sku}?snapshots=${Math.max(1, Math.min(max || 10, 10))}`
            ) as responsify<{ snapshots: SnapshotsTF.Snapshot[] }>;
        },
        Overview: (sku: string) => {
            return this.request('snapshots/overview/sku/' + sku) as responsify<{
                name: string;
                overview: {
                    id: string;
                    savedAt: number;
                    listingsAmount: number;
                }[];
            }>;
        }
    };
    Listings = {
        Get: (steamID: string) => {
            return this.request('listings/steamid/' + steamID);
        }
    };
    Queue = {
        Get: () => {
            return this.request('queue') as Promise<{
                active?: number;
                failed?: number;
                waiting?: number;
            }>;
        }
    };
    Snapshot = {
        Get: (IDorSKU: string) => {
            const sp = IDorSKU.split(';');
            const isSKU = sp.length > 1 && Number(sp[0]) && Number(sp[1]);
            return this.request(`snapshot/${isSKU ? 'sku' : 'id'}/${IDorSKU}`) as responsify<SnapshotsTF.Snapshot>;
        }
    };
    Listing = {
        Get: (id: string) => {
            return this.request('listing/id/' + id) as responsify<SnapshotsTF.Listing>;
        }
    };
}
namespace SnapshotsTF {
    export interface Listing {
        listing: {
            parts: string[];
            spells: string[];
            buying: boolean;
            automatic: boolean;
            listingID: string;
            paint: string;
            currencies: {
                metal: number;
                key: number;
            };
            bumped: number;
            created: number;
            steamID64: string;
        };
        savedAt: number;
        lastSeen: number;
        id: string;
    }
    export interface SnapshotListing {
        id: string;
        savedAt: number;
        lastSeen: number;
        listingID: string;
        steamID64: string;
        paint: string;
        parts: string[];
        spells: string[];
        currencies: {
            metal: number;
            keys: number;
        };
        bumped: number;
        created: number;
        buying: boolean;
        automatic: boolean;
    }
    export interface Snapshot {
        listings: SnapshotListing[];
        savedAt: number;
        id: string;
    }
}

export default SnapshotsTF;
