# Snapshotstf-API
### <p align="center">[![Build Status](https://github.com/Preport/Snapshotstf-API/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/Preport/Snapshotstf-API/actions/workflows/main.yml) [![Npm package (latest)](https://img.shields.io/npm/v/snapshotstf-api/latest)](https://www.npmjs.com/package/snapshotstf-api)</p>

### Usage Example
```ts
import Snapshotstf from 'snapshotstf-api'; // TypeScript
const Snapshotstf = require('snapshotstf-api'); // CommonJS

const Snappy = new Snapshotstf();

// Should return latest 10 snapshots of Mann Co. Supply Crate Key
Snappy.Snapshots.Get("5021;6").then(s => {
    console.log(`First snapshot has: ${s.snapshots[0].length} listings`)
});
```
Everything is typed and endpoints are pretty similar to https://api.snapshots.tf/docs/#/
