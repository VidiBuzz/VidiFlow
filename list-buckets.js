const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

// R2 Configuration from upload-local-video.js
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listBuckets() {
  try {
    console.log('Listing buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('Buckets:');
    if (response.Buckets) {
        response.Buckets.forEach(bucket => {
            console.log(` - ${bucket.Name}`);
        });
    } else {
        console.log('No buckets found.');
    }
  } catch (err) {
    console.error('Error listing buckets:', err);
  }
}

listBuckets();
