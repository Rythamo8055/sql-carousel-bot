#!/usr/bin/env node
// Instagram Carousel Poster — v2 (using imgur upload)

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

if (!IG_USER_ID || !ACCESS_TOKEN) {
  console.error('Missing IG_USER_ID or IG_ACCESS_TOKEN');
  process.exit(1);
}

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

function uploadToImgur(filePath) {
  // Read the image file and encode as base64
  const imageData = fs.readFileSync(filePath).toString('base64');
  
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Date.now();
    const postData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="image"',
      '',
      imageData,
      `--${boundary}`,
      'Content-Disposition: form-data; name="type"',
      '',
      'base64',
      `--${boundary}--`,
      ''
    ].join('\r\n');
    
    const req = https.request({
      hostname: 'api.imgur.com',
      path: '/3/upload',
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID c9a576e6f8e0b6d',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.success) {
            resolve(json.data.link);
          } else {
            reject(new Error(json.data?.error_description || json.data?.error || 'Upload failed'));
          }
        } catch {
          reject(new Error('Failed to parse upload response: ' + d));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function generateImages() {
  console.log('\n=== Generating images from HTML ===');

  execSync(`mkdir -p "${SLIDES_DIR}" "${JPEG_DIR}"`);

  const puppeteer = require('puppeteer');
  let launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setui-sandbox'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    console.log(`Using Chrome: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'content', 'sql-series', `sql-day${String(dayNum).padStart(2, '0')}-grid.html`);
  console.log(`Loading: ${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const slideCount = await page.evaluate(() => {
    return document.querySelectorAll('body > div.slide').length;
  });
  console.log(`Found ${slideCount} slides`);

  for (let i = 1; i <= slideCount; i++) {
    const slideElement = await page.$(`body > div.slide:nth-child(${i})`);
    if (slideElement) {
      await slideElement.screenshot({
        path: path.join(SLIDES_DIR, `slide-${i}.png`),
        type: 'png',
      });
      console.log(`  ✅ slide-${i}.png`);
    }
  }

  await browser.close();

  console.log('\nConverting to JPEG...');
  for (let i = 1; i <= slideCount; i++) {
    const pngPath = path.join(SLIDES_DIR, `slide-${i}.png`);
    const jpgPath = path.join(JPEG_DIR, `slide-${i}.jpg`);
    if (fs.existsSync(pngPath)) {
      execSync(`convert "${pngPath}" -quality 95 "${jpgPath}" 2>/dev/null || magick "${pngPath}" -quality 95 "${jpgPath}" 2>/dev/null`);
      console.log(`  ✅ slide-${i}.jpg`);
    }
  }
}

async function uploadImage(filePath) {
  console.log(`  Uploading ${path.basename(filePath)}...`);
  let uploadResult = '';
  for (let retry = 0; retry < 3; retry++) {
    try {
      uploadResult = await uploadToImgur(filePath);
      if (uploadResult.startsWith('http')) {
        console.log(`  URL: ${uploadResult}`);
        return uploadResult;
      }
    } catch (e) {
      console.log(`    Retry ${retry + 1}: ${e.message}`);
    }
    await sleep(2000);
  }
  throw new Error('Upload failed after 3 retries');
}

async function main() {
  // Generate images if not present
  if (!fs.existsSync(JPEG_DIR) || fs.readdirSync(JPEG_DIR).filter(f => f.endsWith('.jpg')).length === 0) {
    await generateImages();
  }

  let captions = {};
  if (fs.existsSync(CAPTIONS_FILE)) {
    captions = JSON.parse(fs.readFileSync(CAPTIONS_FILE, 'utf8'));
  }
  const caption = captions[`day${dayNum}`] || `SQL Day ${dayNum}/30 — Swipe to learn! Follow @code.ry for daily lessons.`;

  const files = fs.readdirSync(JPEG_DIR).filter(f => f.endsWith('.jpg')).sort();
  if (files.length === 0) {
    console.error('No JPEG files found');
    process.exit(1);
  }

  console.log(`\n=== Posting SQL Day ${dayNum} (${files.length} slides) ===\n`);

  console.log('Step 1: Creating child containers...');
  const childIds = [];
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(JPEG_DIR, files[i]);
    const imageUrl = await uploadImage(filePath);

    const res = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
      image_url: imageUrl,
      is_carousel_item: true,
      access_token: ACCESS_TOKEN,
    });
    console.log(`  Child ${i+1}: ${res.id || JSON.stringify(res)}`);
    if (!res.id) { console.error('Failed to create child'); process.exit(1); }
    childIds.push(res.id);
  }

  console.log('\nStep 2: Waiting for children...');
  for (let i = 0; i < childIds.length; i++) {
    console.log(`  Child ${i+1} (${childIds[i]})...`);
    const ok = await pollContainer(childIds[i]);
    if (!ok) { console.error('Child failed'); process.exit(1); }
  }

  console.log('\nStep 3: Creating carousel...');
  const parentRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: caption,
    access_token: ACCESS_TOKEN,
  });
  console.log(`Parent: ${parentRes.id || JSON.stringify(parentRes)}`);
  if (!parentRes.id) { console.error('Failed to create parent'); process.exit(1); }

  console.log('\nStep 4: Waiting for parent...');
  const ok = await pollContainer(parentRes.id);
  if (!ok) { console.error('Parent failed'); process.exit(1); }

  console.log('\nStep 5: Publishing...');
  const pubRes = await request('POST', `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`, {
    creation_id: parentRes.id,
    access_token: ACCESS_TOKEN,
  });
  console.log('Published!', JSON.stringify(pubRes));

  if (pubRes.id) {
    console.log('\nStep 6: Posting comment...');
    const commentText = `Day ${dayNum}/30 - Complete series at @code.ry | Next: Day ${dayNum+1 <= 30 ? dayNum+1 : '30'} coming tomorrow!`;
    const commentRes = await postComment(pubRes.id, commentText);
    console.log('Comment:', JSON.stringify(commentRes));
  }

  console.log('\n=== DONE ===');
}

main().catch(console.error);
