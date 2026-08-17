const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function exportSlides() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport to slide dimensions
    await page.setViewport({
        width: 1080,
        height: 1350,
        deviceScaleFactor: 2, // For high quality
    });

    // Load the HTML file
    const htmlPath = path.join(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Export each slide
    for (let i = 1; i <= 8; i++) {
        const slideElement = await page.$(`#slide-${i}`);
        
        if (slideElement) {
            await slideElement.screenshot({
                path: path.join(__dirname, `slide-${i}.png`),
                type: 'png',
            });
            console.log(`✅ Exported slide-${i}.png`);
        }
    }

    await browser.close();
    console.log('\n🎉 All slides exported! Ready for Instagram.');
}

// Run if called directly
if (require.main === module) {
    exportSlides().catch(console.error);
}

module.exports = { exportSlides };
