#!/usr/bin/env node
// Regenerate ALL 30 days with correct Instagram dimensions (1080x1350 @2x)

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function regenerateDay(dayNum) {
  const day = String(dayNum).padStart(2, '0');
  const SLIDES_DIR = path.join(__dirname, 'output', `day${day}`);
  const JPEG_DIR = path.join(SLIDES_DIR, 'jpeg');

  execSync(`mkdir -p "${SLIDES_DIR}" "${JPEG_DIR}"`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'content', 'sql-series', `sql-day${day}-grid.html`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const slideCount = await page.evaluate(() => document.querySelectorAll('body > div.slide').length);

  for (let i = 1; i <= slideCount; i++) {
    const slideElement = await page.$(`body > div.slide:nth-child(${i})`);
    if (slideElement) {
      await slideElement.screenshot({ path: path.join(SLIDES_DIR, `slide-${i}.png`), type: 'png' });
    }
  }
  await browser.close();

  for (let i = 1; i <= slideCount; i++) {
    const pngPath = path.join(SLIDES_DIR, `slide-${i}.png`);
    const jpgPath = path.join(JPEG_DIR, `slide-${i}.jpg`);
    if (fs.existsSync(pngPath)) {
      execSync(`magick "${pngPath}" -quality 95 "${jpgPath}" 2>/dev/null || convert "${pngPath}" -quality 95 "${jpgPath}" 2>/dev/null`);
    }
  }

  // Verify dimensions
  const dims = execSync(`identify "${JPEG_DIR}/slide-1.jpg" 2>&1`).toString().trim();
  console.log(`  Day ${dayNum}: ${dims.match(/\d+x\d+/)[0]}`);
}

(async () => {
  console.log('Regenerating all 30 days with correct dimensions (2160x2700)...\n');

  for (let day = 1; day <= 30; day++) {
    process.stdout.write(`  Day ${day}... `);
    await regenerateDay(day);
  }

  console.log('\nDone!');
})().catch(e => { console.error(e); process.exit(1); });
