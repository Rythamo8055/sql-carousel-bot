#!/usr/bin/env node
// Instagram Carousel Poster — Reusable for all 30 days
// Usage: node post-day.js <day-number>
// Example: node post-day.js 5

const https = require('https');
const fs = require('fs');
const path = require('path');

const IG_USER_ID = '17841433829204184';
const ACCESS_TOKEN = 'EAAV93GHBZAxwBSHpdmK0ZAb0ONMvjXuV6lXZAZCczkqkjMRGH1khFCNh3TZC5hl2kz2pyME4IzY9vUgtCguOnGHPY9lwiWrSvv8SWLhusMz8zgUPdveBTm2biNwalXgFZApjrlTfrm7ZCJCIbwv57UPefVc52gZBYQfKUWqSietH17cnTA9sZBeUU3wtH8On0ZAEugeQZDZD';

const dayNum = parseInt(process.argv[2]);
if (!dayNum || dayNum < 1 || dayNum > 30) {
  console.error('Usage: node post-day.js <day-number> (1-30)');
  process.exit(1);
}

const SLIDES_DIR = path.join(__dirname, 'output', `day${String(dayNum).padStart(2, '0')}`);
const JPEG_DIR = path.join(SLIDES_DIR, 'jpeg');
const CAPTIONS_FILE = path.join(__dirname, 'content', 'sql-series', 'captions.json');

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = { method, hostname: u.hostname, path: u.pathname + u.search, headers: {} };
    if (body) {
      const data = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pollContainer(id, maxAttempts = 25) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await request('GET', `https://graph.facebook.com/v21.0/${id}?fields=status_code&access_token=${ACCESS_TOKEN}`);
    console.log(`  Poll ${i+1}: ${res.status_code}`);
    if (res.status_code === 'FINISHED') return true;
    if (res.status_code === 'ERROR' || res.status_code === 'EXPIRED') {
      console.error(`  Container ${id} failed: ${res.status_code}`);
      return false;
    }
    await sleep(3000 + i * 1500);
  }
  return false;
}

async function postComment(mediaId, text) {
  const res = await request('POST', `https://graph.facebook.com/v21.0/${mediaId}/comments`, {
    message: text,
    access_token: ACCESS_TOKEN,
  });
  return res;
}

async function main() {
  // Load caption
  let captions = {};
  if (fs.existsSync(CAPTIONS_FILE)) {
    captions = JSON.parse(fs.readFileSync(CAPTIONS_FILE, 'utf8'));
  }
  const caption = captions[`day${dayNum}`] || `SQL Day ${dayNum}/30 — Swipe to learn! Follow @code.ry for daily lessons.`;

  // Find JPEG files
  if (!fs.existsSync(JPEG_DIR)) {
    console.error(`No JPEG dir found at ${JPEG_DIR}`);
    console.error('Run the PNG→JPEG conversion first.');
    process.exit(1);
  }

  const files = fs.readdirSync(JPEG_DIR).filter(f => f.endsWith('.jpg')).sort();
  if (files.length === 0) {
    console.error('No JPEG files found');
    process.exit(1);
  }

  console.log(`\n=== Posting SQL Day ${dayNum} (${files.length} slides) ===\n`);

  // Step 1: Create child containers
  console.log('Step 1: Creating child containers...');
  const childIds = [];
  for (let i = 0; i < files.length; i++) {
    // Upload to catbox.moe first
    const filePath = path.join(JPEG_DIR, files[i]);
    console.log(`  Uploading ${files[i]}...`);
    const { execSync } = require('child_process');
    const uploadResult = execSync(`curl -s -F "reqtype=fileupload" -F "fileToUpload=@${filePath}" https://catbox.moe/user/api.php`).toString().trim();
    console.log(`  URL: ${uploadResult}`);

    const res = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
      image_url: uploadResult,
      is_carousel_item: true,
      access_token: ACCESS_TOKEN,
    });
    console.log(`  Child ${i+1}: ${res.id || JSON.stringify(res)}`);
    if (!res.id) { console.error('Failed to create child'); process.exit(1); }
    childIds.push(res.id);
  }

  // Step 2: Wait for children
  console.log('\nStep 2: Waiting for children...');
  for (let i = 0; i < childIds.length; i++) {
    console.log(`  Child ${i+1} (${childIds[i]})...`);
    const ok = await pollContainer(childIds[i]);
    if (!ok) { console.error('Child failed'); process.exit(1); }
  }

  // Step 3: Create carousel parent
  console.log('\nStep 3: Creating carousel...');
  const parentRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: caption,
    access_token: ACCESS_TOKEN,
  });
  console.log(`Parent: ${parentRes.id || JSON.stringify(parentRes)}`);
  if (!parentRes.id) { console.error('Failed to create parent'); process.exit(1); }

  // Step 4: Wait for parent
  console.log('\nStep 4: Waiting for parent...');
  const ok = await pollContainer(parentRes.id);
  if (!ok) { console.error('Parent failed'); process.exit(1); }

  // Step 5: Publish
  console.log('\nStep 5: Publishing...');
  const pubRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`, {
    creation_id: parentRes.id,
    access_token: ACCESS_TOKEN,
  });
  console.log('Published!', JSON.stringify(pubRes));

  // Step 6: Auto-comment
  if (pubRes.id) {
    console.log('\nStep 6: Posting comment...');
    const commentText = `Day ${dayNum}/30 - Complete series at @code.ry | Next: Day ${dayNum+1 <= 30 ? dayNum+1 : '30'} coming tomorrow!`;
    const commentRes = await postComment(pubRes.id, commentText);
    console.log('Comment:', JSON.stringify(commentRes));
  }

  console.log('\n=== DONE ===');
}

main().catch(console.error);
