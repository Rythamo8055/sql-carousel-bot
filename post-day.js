#!/usr/bin/env node
// Instagram Carousel Poster — v3 (uses GitHub raw URLs, no upload needed)
// Usage: node post-day.js <day-number>

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env file if it exists (for local dev)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) process.env[key.trim()] = value.join('=').trim();
  });
}

const IG_USER_ID = process.env.IG_USER_ID;
const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const GITHUB_REPO = 'Rythamo8055/sql-carousel-bot';
const GITHUB_BRANCH = 'images';

if (!IG_USER_ID || !ACCESS_TOKEN) {
  console.error('Missing IG_USER_ID or IG_ACCESS_TOKEN');
  process.exit(1);
}

const dayNum = parseInt(process.argv[2]);
if (!dayNum || dayNum < 1 || dayNum > 30) {
  console.error('Usage: node post-day.js <day-number> (1-30)');
  process.exit(1);
}

const CAPTIONS_FILE = path.join(__dirname, 'content', 'sql-series', 'captions.json');
const SLIDES_DIR = path.join(__dirname, 'output', `day${String(dayNum).padStart(2, '0')}`);
const JPEG_DIR = path.join(SLIDES_DIR, 'jpeg');

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

function getGitHubRawUrl(dayNumber, slideNumber) {
  const day = String(dayNumber).padStart(2, '0');
  return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/output/day${day}/jpeg/slide-${slideNumber}.jpg`;
}

async function main() {
  // Load caption
  let captions = {};
  if (fs.existsSync(CAPTIONS_FILE)) {
    captions = JSON.parse(fs.readFileSync(CAPTIONS_FILE, 'utf8'));
  }
  const caption = captions[`day${dayNum}`] || `SQL Day ${dayNum}/30 — Swipe to learn! Follow @code.ry for daily lessons.`;

  const slideCount = 6; // All 30 days have 6 slides

  console.log(`\n=== Posting SQL Day ${dayNum} (${slideCount} slides) ===\n`);

  // Step 1: Create child containers using GitHub raw URLs
  console.log('Step 1: Creating child containers...');
  const childIds = [];
  for (let i = 1; i <= slideCount; i++) {
    const imageUrl = getGitHubRawUrl(dayNum, i);
    console.log(`  Slide ${i}: ${imageUrl}`);

    const res = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
      image_url: imageUrl,
      is_carousel_item: true,
      access_token: ACCESS_TOKEN,
    });
    console.log(`  Child ${i}: ${res.id || JSON.stringify(res)}`);
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
    const commentText = `Day ${dayNum}/30 — Complete series at @code.ry | Next: Day ${dayNum+1 <= 30 ? dayNum+1 : '30'} coming tomorrow!`;
    const commentRes = await postComment(pubRes.id, commentText);
    console.log('Comment:', JSON.stringify(commentRes));
  }

  console.log('\n=== DONE ===');
}

main().catch(console.error);
