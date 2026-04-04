#!/usr/bin/env node

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';

console.log('Checking credentials...\n');
console.log('Account ID:', R2_ACCOUNT_ID);
console.log('Access Key:', R2_ACCESS_KEY_ID.substring(0, 10) + '...');
console.log('\nThis bucket is accessible at:');
console.log(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
console.log('\nTo access this in Cloudflare dashboard:');
console.log(`1. Go to: https://dash.cloudflare.com`);
console.log(`2. Look for Account ID: ${R2_ACCOUNT_ID}`);
console.log(`3. Or check: https://dash.cloudflare.com/?account=${R2_ACCOUNT_ID}`);
console.log('\nThis is likely a DIFFERENT Cloudflare account than where you see vidi1/mvv/vs-drive');
