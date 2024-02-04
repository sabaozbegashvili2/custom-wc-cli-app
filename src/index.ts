#!/usr/bin/env node

const wc = require('./myWc');

// Create an async function to wrap the call to wc
async function main(): Promise<void> {
    await wc(process.argv, process.stdin);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
