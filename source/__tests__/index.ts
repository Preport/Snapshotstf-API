import snapshotstf from '..';

const snappy = new snapshotstf();

jest.setTimeout(30000);
test('Index Functions', async () => {
    const [stats, overview] = await Promise.all([snappy.Stats(), snappy.Overview()]);
    expect(typeof stats.listings).toBe('number');
    expect(typeof stats.snapshots).toBe('number');
    //
    expect(typeof overview.amount).toBe('number');
    expect(typeof overview.items).toBe('object');
});

test('Snapshots Functions', async () => {
    const [sku, overview] = await Promise.all([snappy.Snapshots.Get('5021;6'), snappy.Snapshots.Overview('5021;6')]);
    expect(sku.snapshots.length).toBeLessThanOrEqual(10);
    expect(Object.keys(sku.snapshots[0])).toStrictEqual(['listings', 'savedAt', 'id']);
    expect(Object.keys(sku.snapshots[0].listings[0])).toStrictEqual([
        'id',
        'savedAt',
        'lastSeen',
        'listingID',
        'steamID64',
        'paint',
        'parts',
        'spells',
        'currencies',
        'bumped',
        'created',
        'buying',
        'automatic'
    ]);
    expect(sku.sku).toBe('5021;6');
    //
    expect(overview.sku).toBe('5021;6');
    expect(Object.keys(overview.overview[0])).toStrictEqual(['id', 'savedAt', 'listingsAmount']);
    expect(overview.name).toBe('Mann Co. Supply Crate Key');
});

// 400 moment
//test("Listing Function", async () => {
//
//})

test('Queue Function', async () => {
    const get = await snappy.Queue.Get();
    expect(get.active).not.toBeNaN();
    expect(get.failed).not.toBeNaN();
    expect(get.waiting).not.toBeNaN();
});

test('Snapshot Functions', async () => {
    const get = await snappy.Snapshot.Get('5021;6');
    expect(Object.keys(get.listings[0])).toStrictEqual([
        'id',
        'savedAt',
        'lastSeen',
        'listingID',
        'steamID64',
        'paint',
        'parts',
        'spells',
        'currencies',
        'bumped',
        'created',
        'buying',
        'automatic'
    ]);
    expect(typeof get.id).toBe('string');
    expect(get.sku).toBe('5021;6');

    //Listing is also here cause (〜￣▽￣)〜.

    const [listing, snap] = await Promise.all([snappy.Listing.Get(get.listings[0].id), snappy.Snapshot.Get(get.id)]);
    expect(Object.keys(listing)).toStrictEqual(['listing', 'sku', 'savedAt', 'lastSeen', 'id']);
    expect(Object.keys(snap.listings[0])).toStrictEqual([
        'id',
        'savedAt',
        'lastSeen',
        'listingID',
        'steamID64',
        'paint',
        'parts',
        'spells',
        'currencies',
        'bumped',
        'created',
        'buying',
        'automatic'
    ]);
});

test('Error Handling', async () => {
    // add an intentional error
    const proms = [
        //@ts-expect-error
        snappy.Snapshots.Get('5021;6', 'ew'),
        snappy.Request('5021;6'),
        snappy.Listings.Get('76561198085810371')
    ];

    expect(
        (await Promise.allSettled(proms)).map(prom => {
            //@ts-expect-error
            console.log(prom.reason.message);
            return prom.status == 'rejected' && typeof prom.reason.message === 'string';
        })
    ).not.toContain(false);
});

afterAll(async () => {
    //change Rate limit
    snappy.__rateNumber = 0;
    await snappy.Snapshots.Get('5021;6').catch(err => {
        expect(err).toHaveProperty('message');
    });
    clearInterval(snappy.__rateHandler);
});
