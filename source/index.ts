import got from "got";
class Snapshot {
    private readonly apiKey: string;
    //I currently don't know how site's ratelimit works so this might be wrong UwU
    private rateLimit: number[] = [];

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
        setInterval(() => {
            let i: number;
            const time = new Date().valueOf();
            for (i = 0; i < this.rateLimit.length; i++) {
                if (this.rateLimit[i] + 60000 > time) break;
            }
            this.rateLimit.splice(0, i);
        }, 100);
    }
    private async rate(tries?: number) {
        if (this.rateLimit.length < 60)
            this.rateLimit.push(new Date().valueOf());
        else if (tries === 5)
            throw {
                statusCode: null,
                message: "This would exceed our rateLimit",
            };
        else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.rate((tries || 0) + 1);
        }
    }
    private async request(
        url: string,
        type?: "get" | "post",
        needKey?: boolean
    ) {
        await this.rate();
        return await got[type || "get"]("https://api.snapshots.tf/" + url, {
            headers: {
                accept: "application/json",
                SNAPSHOT_KEY: needKey ? this.apiKey : "",
            },
        })
            .then(data => JSON.parse(data.body))
            .catch(err => {
                throw err.body || err;
            });
    }
    Stats() {
        return this.request("stats") as Promise<{
            snapshots: number;
            listings: number;
        }>;
    }
    Request(sku: string) {
        return this.request("request/" + sku, "post", true); // as Promise<"bruh">
    }
    Overview() {
        return this.request("overview") as Promise<{
            items: string[];
            amount: number;
        }>;
    }

    Snapshots = {
        Get: (sku: string, max?: number) => {
            return this.request(
                `snapshots/sku/${sku}?snapshots=${Math.max(
                    1,
                    Math.min(max || 10, 10)
                )}`
            ) as Promise<{ sku: string; snapshots: Snapshot.Listing[][] }>;
        },
        Overview: (sku: string) => {
            return this.request("snapshots/overview/sku/" + sku) as Promise<{
                sku: string;
                name: string;
                overview: {
                    id: string;
                    savedAt: number;
                    listingsAmount: number;
                }[];
            }>;
        },
    };
    Listings = {
        Get: (steamID: string) => {
            return this.request("listings/steamid/" + steamID);
        },
    };
    Queue = {
        Get: () => {
            return this.request("queue") as Promise<{
                active?: number;
                failed?: number;
                waiting?: number;
            }>;
        },
    };
    Snapshot = {
        Get: (IDorSKU: string) => {
            const sp = IDorSKU.split(";");
            const isSKU = sp.length > 1 && Number(sp[0]) && Number(sp[1]);
            return this.request(
                `snapshot/${isSKU ? "sku" : "id"}/${IDorSKU}`
            ) as Promise<{
                id: string;
                sku: string;
                listings: Snapshot.Listing[];
            }>;
        },
    };
    Listing = {
        Get: (id: string) => {
            return this.request(
                "listing/id/" + id
            ) as Promise<Snapshot.Listing>;
        },
    };
}
namespace Snapshot {
    export interface Listing {
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
}

export default Snapshot;
