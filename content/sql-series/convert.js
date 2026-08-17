const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  htmlDir: path.join(__dirname, 'html'),
  outputDir: path.join(__dirname, 'output', 'png'),
  viewport: { width: 1080, height: 1080 },
  waitTimeout: 3000, // Wait for fonts to load
  format: 'png'
};

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.htmlDir)) {
    fs.mkdirSync(CONFIG.htmlDir, { recursive: true });
    console.log(`Created directory: ${CONFIG.htmlDir}`);
  }
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created directory: ${CONFIG.outputDir}`);
  }
}

// Get all HTML files
function getHtmlFiles() {
  return fs.readdirSync(CONFIG.htmlDir)
    .filter(f => f.endsWith('.html'))
    .sort();
}

// Convert single HTML file to PNG
async function convertFile(browser, fileName) {
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewport(CONFIG.viewport);
    
    // Navigate to HTML file
    const filePath = path.join(CONFIG.htmlDir, fileName);
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
    
    // Wait for fonts and content to load
    await page.waitForTimeout(CONFIG.waitTimeout);
    
    // Count slides
    const slideCount = await page.$$eval('.slide', slides => slides.length);
    
    if (slideCount === 0) {
      console.log(`⚠️  No slides found in ${fileName}`);
      return;
    }
    
    console.log(`📄 Processing ${fileName} (${slideCount} slides)`);
    
    // Capture each slide
    for (let i = 0; i < slideCount; i++) {
      // Scroll to slide
      await page.evaluate((index) => {
        const slides = document.querySelectorAll('.slide');
        if (slides[index]) {
          slides[index].scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, i);
      
      // Wait for scroll to complete
      await page.waitForTimeout(500);
      
      // Generate output filename
      const baseName = fileName.replace('.html', '');
      const pngName = `${baseName}-slide${String(i + 1).padStart(2, '0')}.png`;
      const outputPath = path.join(CONFIG.outputDir, pngName);
      
      // Screenshot the current slide
      const slideElement = await page.$('.slide');
      if (slideElement) {
        await slideElement.screenshot({ path: outputPath });
      } else {
        await page.screenshot({ path: outputPath });
      }
      
      console.log(`  ✅ ${pngName}`);
    }
    
  } catch (error) {
    console.error(`❌ Error converting ${fileName}:`, error.message);
  } finally {
    await page.close();
  }
}

// Main conversion function
async function convertAll() {
  console.log('🚀 Starting HTML to PNG conversion...\n');
  
  ensureDirectories();
  
  const htmlFiles = getHtmlFiles();
  
  if (htmlFiles.length === 0) {
    console.log('❌ No HTML files found in:', CONFIG.htmlDir);
    console.log('📁 Please copy HTML files to:', CONFIG.htmlDir);
    return;
  }
  
  console.log(`📂 Found ${htmlFiles.length} HTML files\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const file of htmlFiles) {
      await convertFile(browser, file);
    }
    
    console.log('\n✅ Conversion complete!');
    console.log(`📁 Output folder: ${CONFIG.outputDir}`);
    
    // List generated files
    const pngFiles = fs.readdirSync(CONFIG.outputDir).filter(f => f.endsWith('.png'));
    console.log(`📸 Generated ${pngFiles.length} PNG files`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the conversion
convertAll().catch(console.error);
