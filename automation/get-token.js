// ============================================================
// get-token.js
// Generates a long-lived access token (60 days) for Instagram
// ============================================================
// Usage: node get-token.js
// Requires: INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in .env
//           + a short-lived token from Graph API Explorer

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  console.error('❌ Missing INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET in .env');
  process.exit(1);
}

// Read short-lived token from command line or prompt
const SHORT_TOKEN = process.argv[2];

if (!SHORT_TOKEN) {
  console.log('');
  console.log('📋 HOW TO GET YOUR SHORT-LIVED TOKEN:');
  console.log('   1. Go to: https://developers.facebook.com/tools/explorer');
  console.log('   2. Top-left dropdown → select YOUR APP');
  console.log('   3. Click "Generate Access Token"');
  console.log('   4. Check ALL these permissions:');
  console.log('      ✅ instagram_basic');
  console.log('      ✅ instagram_content_publish');
  console.log('      ✅ instagram_manage_comments');
  console.log('      ✅ pages_show_list');
  console.log('      ✅ pages_read_engagement');
  console.log('   5. Click "Generate Access Token"');
  console.log('   6. Copy the token (starts with EAA...)');
  console.log('');
  console.log('   Then run:');
  console.log('   node get-token.js YOUR_SHORT_TOKEN_HERE');
  console.log('');
  process.exit(0);
}

async function exchangeToken() {
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${APP_ID}` +
    `&client_secret=${APP_SECRET}` +
    `&grant_type=fb_exchange_token` +
    `&fb_exchange_token=${SHORT_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ Error:', data.error.message);
      process.exit(1);
    }

    const longToken = data.access_token;
    const expiresIn = data.expires_in;
    const expiresDate = new Date(Date.now() + expiresIn * 1000).toLocaleDateString();

    console.log('');
    console.log('✅ LONG-LIVED TOKEN GENERATED!');
    console.log('');
    console.log('Token:', longToken);
    console.log('Expires in:', expiresIn, 'seconds (' + expiresDate + ')');
    console.log('');

    // Update .env file automatically
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(
      /INSTAGRAM_ACCESS_TOKEN=.*/,
      `INSTAGRAM_ACCESS_TOKEN=${longToken}`
    );
    fs.writeFileSync(envPath, envContent);

    console.log('✅ .env file updated automatically!');
    console.log('');

  } catch (err) {
    console.error('❌ Network error:', err.message);
    process.exit(1);
  }
}

exchangeToken();
