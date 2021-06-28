import snapshotstf from "..";

const snappy = new snapshotstf();

jest.setTimeout(30000);
test("Index Functions", async () => {
    const [stats, overview] = await Promise.all([
        snappy.Stats(),
        snappy.Overview(),
    ]);
    expect(typeof stats.listings).toBe("number");
    expect(typeof stats.snapshots).toBe("number");
    //
    expect(typeof overview.amount).toBe("number");
    expect(typeof overview.items).toBe("object");
});

test("Snapshots Functions", async () => {
    const [sku, overview] = await Promise.all([
        snappy.Snapshots.Get("5021;6"),
        snappy.Snapshots.Overview("5021;6"),
    ]);
    expect(sku.snapshots.length).toBeLessThanOrEqual(10);
    expect(Object.keys(sku.snapshots[0][0])).toStrictEqual([
        "id",
        "savedAt",
        "lastSeen",
        "listingID",
        "steamID64",
        "paint",
        "parts",
        "spells",
        "currencies",
        "bumped",
        "created",
        "buying",
        "automatic",
    ]);
    expect(sku.sku).toBe("5021;6");
    //
    expect(overview.sku).toBe("5021;6");
    expect(Object.keys(overview.overview[0])).toStrictEqual([
        "id",
        "savedAt",
        "listingsAmount",
    ]);
    expect(overview.name).toBe("Mann Co. Supply Crate Key");
});

// 400 moment
//test("Listing Function", async () => {
//
//})

test("Queue Function", async () => {
    const get = await snappy.Queue.Get();
    expect(get.active).not.toBeNaN();
    expect(get.failed).not.toBeNaN();
    expect(get.waiting).not.toBeNaN();
});

test("Snapshot Functions", async () => {
    const get = await snappy.Snapshot.Get("5021;6");
    expect(Object.keys(get.listings[0])).toStrictEqual([
        "id",
        "savedAt",
        "lastSeen",
        "listingID",
        "steamID64",
        "paint",
        "parts",
        "spells",
        "currencies",
        "bumped",
        "created",
        "buying",
        "automatic",
    ]);
    expect(typeof get.id).toBe("string");
    expect(get.sku).toBe("5021;6");
});
