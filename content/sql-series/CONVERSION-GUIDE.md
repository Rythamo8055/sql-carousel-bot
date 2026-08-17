# HTML to PNG Conversion Guide

## Why Conversion is Needed
- Instagram only accepts images (PNG/JPG)
- HTML files need to be screenshotted
- Each slide becomes one image in carousel

---

## Method 1: Browser Screenshot (Manual)

### Steps:
1. Open HTML file in Chrome/Edge
2. Press F12 for Developer Tools
3. Press Ctrl+Shift+M for device toolbar
4. Set dimensions to 1080x1080 or 1080x1350
5. Screenshot each slide
6. Save as PNG

### Keyboard Shortcuts:
- **Windows**: Ctrl+Shift+S
- **Mac**: Cmd+Shift+4
- **Full page**: Ctrl+Shift+P → "Capture full size screenshot"

---

## Method 2: Puppeteer Script (Automated)

### Setup:
```bash
npm init -y
npm install puppeteer
```

### Script (convert.js):
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync('./html')
  .filter(f => f.endsWith('.html'));

(async () => {
  const browser = await puppeteer.launch();
  
  for (const file of htmlFiles) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    
    const filePath = path.join(__dirname, 'html', file);
    await page.goto(`file://${filePath}`);
    
    // Wait for fonts to load
    await page.waitForTimeout(2000);
    
    // Get slide count
    const slideCount = await page.$$eval('.slide', slides => slides.length);
    
    for (let i = 0; i < slideCount; i++) {
      // Scroll to slide
      await page.evaluate((index) => {
        const slides = document.querySelectorAll('.slide');
        if (slides[index]) {
          slides[index].scrollIntoView();
        }
      }, i);
      
      // Screenshot slide
      const pngName = file.replace('.html', `-slide${i+1}.png`);
      await page.screenshot({
        path: path.join(__dirname, 'png', pngName),
        fullPage: false
      });
      
      console.log(`Converted: ${pngName}`);
    }
    
    await page.close();
  }
  
  await browser.close();
  console.log('All conversions complete!');
})();
```

### Run:
```bash
mkdir html png
# Copy all HTML files to html/ folder
node convert.js
```

---

## Method 3: Online Tools

### Option A: html2image.com
1. Upload HTML file
2. Set dimensions (1080x1080)
3. Download PNG

### Option B: screenshotapi.net
1. Paste HTML URL
2. Set viewport size
3. Get screenshot

### Option C: carbon.now.sh
1. Paste code snippets
2. Customize style
3. Download as PNG

---

## Method 4: Figma/Canva (Design)

### Steps:
1. Create 1080x1080 canvas
2. Recreate carousel design
3. Export as PNG
4. Use for Instagram

---

## File Naming Convention

```
sql-day01-slide1.png
sql-day01-slide2.png
sql-day01-slide3.png
sql-day01-slide4.png
sql-day01-slide5.png
sql-day01-slide6.png
```

---

## Batch Conversion Script

### Windows (PowerShell):
```powershell
$files = Get-ChildItem *.html
foreach ($file in $files) {
    Write-Host "Converting: $($file.Name)"
    # Add your conversion logic here
}
```

### Mac/Linux (Bash):
```bash
for file in *.html; do
    echo "Converting: $file"
    # Add your conversion logic here
done
```

---

## Quality Settings

### Recommended:
- **Resolution**: 1080x1080px (square) or 1080x1350px (portrait)
- **Format**: PNG (best quality) or JPG (smaller size)
- **DPI**: 72 (web standard)
- **Compression**: None for PNG, 85% for JPG

---

## Checklist Before Upload

- [ ] All 30 SQL days converted
- [ ] All 8 general carousels converted
- [ ] File names follow convention
- [ ] Images are clear and readable
- [ ] No text cut off
- [ ] Colors match original HTML
- [ ] File size under 30MB per image
