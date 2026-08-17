#!/usr/bin/env node
// Instagram Carousel Post — with proper polling
const https = require('https');
const http = require('http');

const IG_USER_ID = '17841433829204184';
const ACCESS_TOKEN = 'EAAV93GHBZAxwBSHpdmK0ZAb0ONMvjXuV6lXZAZCczkqkjMRGH1khFCNh3TZC5hl2kz2pyME4IzY9vUgtCguOnGHPY9lwiWrSvv8SWLhusMz8zgUPdveBTm2biNwalXgFZApjrlTfrm7ZCJCIbwv57UPefVc52gZBYQfKUWqSietH17cnTA9sZBeUU3wtH8On0ZAEugeQZDZD';

const IMAGES = [
  'https://files.catbox.moe/nv7js0.jpg',
  'https://files.catbox.moe/5wuc7u.jpg',
  'https://files.catbox.moe/ln7378.jpg',
  'https://files.catbox.moe/yf38zt.jpg',
  'https://files.catbox.moe/0wi818.jpg',
  'https://files.catbox.moe/kq2w9e.jpg',
];

const CAPTION = `SQL Day 1/30 — What is SQL?\n\nSQL (Structured Query Language) is how you talk to databases.\n\nThink of it like WhatsApp — but instead of texting friends, you're texting your data.\n\nSwipe through to learn:\n→ What SQL actually is\n→ Why it matters\n→ How it looks in real life\n\nFollow @code.ry for daily SQL lessons!\n\n#SQL #LearnSQL #Database #Coding #Tech #Developer #SQLTutorial #Day1`;

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const opts = { method, hostname: u.hostname, path: u.pathname + u.search, headers: {} };
    if (body) {
      const data = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = mod.request(opts, res => {
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

async function pollContainer(id, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await request('GET', `https://graph.facebook.com/v21.0/${id}?fields=status_code&access_token=${ACCESS_TOKEN}`);
    console.log(`  Poll ${i+1}: ${res.status_code}`);
    if (res.status_code === 'FINISHED') return true;
    if (res.status_code === 'ERROR' || res.status_code === 'EXPIRED') {
      console.error(`  Container ${id} failed: ${res.status_code}`);
      return false;
    }
    await sleep(3000 + i * 1000); // exponential backoff
  }
  return false;
}

async function main() {
  console.log('=== Step 1: Creating child containers ===');
  const childIds = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const res = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
      image_url: IMAGES[i],
      is_carousel_item: true,
      access_token: ACCESS_TOKEN,
    });
    console.log(`Child ${i+1}: ${res.id || JSON.stringify(res)}`);
    if (!res.id) { console.error('Failed to create child', i+1); process.exit(1); }
    childIds.push(res.id);
  }

  console.log('\n=== Step 2: Waiting for children to finish ===');
  for (let i = 0; i < childIds.length; i++) {
    console.log(`Polling child ${i+1} (${childIds[i]})...`);
    const ok = await pollContainer(childIds[i]);
    if (!ok) { console.error('Child failed'); process.exit(1); }
  }

  console.log('\n=== Step 3: Creating carousel parent ===');
  const parentRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: CAPTION,
    access_token: ACCESS_TOKEN,
  });
  console.log(`Parent: ${parentRes.id || JSON.stringify(parentRes)}`);
  if (!parentRes.id) { console.error('Failed to create parent'); process.exit(1); }

  console.log('\n=== Step 4: Waiting for parent to finish ===');
  const parentOk = await pollContainer(parentRes.id);
  if (!parentOk) { console.error('Parent failed'); process.exit(1); }

  console.log('\n=== Step 5: Publishing ===');
  const pubRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`, {
    creation_id: parentRes.id,
    access_token: ACCESS_TOKEN,
  });
  console.log('Published!', JSON.stringify(pubRes, null, 2));
}

main().catch(console.error);
