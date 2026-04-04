#!/usr/bin/env node

// Migrate all files from old vidismart bucket (account we can't login to)
// to new bucket on vidistudios@gmail.com account

const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

// SOURCE: Old account (5830508...) - can't login to dashboard
const sourceClient = new S3Client({
  region: 'auto',
  endpoint: 'https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'e9c7b7eb9ea570cc59e413cfdf580deb',
    secretAccessKey: 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
  },
});

// DESTINATION: vidistudios@gmail.com account (c34ed...)
const destClient = new S3Client({
  region: 'auto',
  endpoint: 'https://c34ed2318a802ffba558c8863100d368.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'f3270ad73bccf5b06bf8eaa32a7dfbec',
    secretAccessKey: 'c3361354d2d401a4ca33f06091708592e170db58ce278aa01042aa36b992bc41',
  },
});

const SOURCE_BUCKET = 'vidismart';
const DEST_BUCKET = 'vidismart-cdn';
const CONCURRENCY = 5;

function getContentType(key) {
  const ext = key.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript',
    'json': 'application/json', 'md': 'text/markdown',
    'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
    'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
    'mp4': 'video/mp4', 'webm': 'video/webm', 'mov': 'video/quicktime',
    'pdf': 'application/pdf',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zstd': 'application/zstd',
  };
  return types[ext] || 'application/octet-stream';
}

async function ensureBucket() {
  try {
    await destClient.send(new HeadBucketCommand({ Bucket: DEST_BUCKET }));
    console.log(`Bucket '${DEST_BUCKET}' exists.`);
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404 || err.$metadata?.httpStatusCode === 403) {
      console.log(`Creating bucket '${DEST_BUCKET}'...`);
      await destClient.send(new CreateBucketCommand({ Bucket: DEST_BUCKET }));
      console.log(`Bucket '${DEST_BUCKET}' created.`);
    } else {
      throw err;
    }
  }
}

async function listAll() {
  const all = [];
  let token;
  do {
    const res = await sourceClient.send(new ListObjectsV2Command({
      Bucket: SOURCE_BUCKET, MaxKeys: 1000, ContinuationToken: token,
    }));
    if (res.Contents) all.push(...res.Contents);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return all;
}

async function copyOne(key, idx, total) {
  try {
    const res = await sourceClient.send(new GetObjectCommand({ Bucket: SOURCE_BUCKET, Key: key }));
    const chunks = [];
    for await (const chunk of res.Body) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const isMedia = /\.(png|jpg|jpeg|gif|webp|svg|mp4|webm|mov)$/i.test(key);
    await destClient.send(new PutObjectCommand({
      Bucket: DEST_BUCKET, Key: key, Body: body,
      ContentType: getContentType(key),
      CacheControl: isMedia ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    }));

    const mb = (body.length / 1024 / 1024).toFixed(2);
    console.log(`[${idx}/${total}] ${key} (${mb} MB)`);
    return { success: true, size: body.length };
  } catch (err) {
    console.error(`[${idx}/${total}] FAILED: ${key} - ${err.message}`);
    return { success: false, key, error: err.message };
  }
}

async function migrate() {
  console.log('R2 Bucket Migration');
  console.log(`FROM: vidismart @ account 5830508...`);
  console.log(`TO:   ${DEST_BUCKET} @ vidistudios account c34ed...\n`);

  await ensureBucket();

  console.log('Listing source files...');
  const objects = await listAll();
  console.log(`Found ${objects.length} files to migrate.\n`);

  let idx = 0;
  const results = [];
  for (let i = 0; i < objects.length; i += CONCURRENCY) {
    const batch = objects.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(obj => { idx++; return copyOne(obj.Key, idx, objects.length); })
    );
    results.push(...batchResults);
  }

  const ok = results.filter(r => r.success);
  const fail = results.filter(r => !r.success);
  const totalMB = (ok.reduce((s, r) => s + r.size, 0) / 1024 / 1024).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log(`Migrated: ${ok.length}/${objects.length} files (${totalMB} MB)`);
  if (fail.length > 0) {
    console.log(`Failed: ${fail.length} files:`);
    fail.forEach(f => console.log(`  - ${f.key}: ${f.error}`));
  }
  console.log('\nNEXT STEPS:');
  console.log(`1. In Cloudflare (vidistudios) -> R2 -> ${DEST_BUCKET} -> Settings -> Custom Domains`);
  console.log('2. Add custom domain: cdn.vidi.news');
  console.log('3. Update AppFlowy .env AWS credentials to vidistudios R2 keys');
  console.log('4. Restart AppFlowy containers');
}

migrate().catch(err => { console.error('Fatal:', err); process.exit(1); });
