const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Account c34ed2318a802ffba558c8863100d368 (The one with vidi1 bucket)
const R2_ACCOUNT_ID = 'c34ed2318a802ffba558c8863100d368';
const R2_ACCESS_KEY_ID = 'f3270ad73bccf5b06bf8eaa32a7dfbec';
const R2_SECRET_ACCESS_KEY = 'c3361354d2d401a4ca33f06091708592e170db58ce278aa01042aa36b992bc41';
const BUCKET_NAME = 'vidi1';

const VIDEO_FILENAME = 'The_Visual_AI_Smart_Stack.mp4';
const LOCAL_VIDEO_PATH = path.join(__dirname, VIDEO_FILENAME);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToVidi1() {
  console.log(`Uploading ${VIDEO_FILENAME} to bucket ${BUCKET_NAME} in account ${R2_ACCOUNT_ID}...`);
  
  if (!fs.existsSync(LOCAL_VIDEO_PATH)) {
      throw new Error(`File not found: ${LOCAL_VIDEO_PATH}`);
  }

  const stats = fs.statSync(LOCAL_VIDEO_PATH);
  const fileStream = fs.createReadStream(LOCAL_VIDEO_PATH);

  const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: VIDEO_FILENAME,
      Body: fileStream,
      ContentType: 'video/mp4',
      ContentLength: stats.size,
  });

  try {
      await s3Client.send(command);
      console.log('✅ Success! Video uploaded to vidi1.');
  } catch (err) {
      console.error('❌ Upload failed:', err.message);
  }
}

uploadToVidi1();
