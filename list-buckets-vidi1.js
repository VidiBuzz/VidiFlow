const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

// Trying the other account from R2 Connect.md
const R2_ACCOUNT_ID = 'c34ed2318a802ffba558c8863100d368';
const R2_ACCESS_KEY_ID = 'f3270ad73bccf5b06bf8eaa32a7dfbec';
const R2_SECRET_ACCESS_KEY = 'c3361354d2d401a4ca33f06091708592e170db58ce278aa01042aa36b992bc41';

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
    console.log(`Listing buckets for account ${R2_ACCOUNT_ID}...`);
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
    console.error('Error listing buckets:', err.message);
  }
}

listBuckets();
