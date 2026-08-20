// ============================================================
// get-ids.js
// Fetches your Facebook Page ID + Instagram Business Account ID
// ============================================================
// Usage: node get-ids.js
// Requires: INSTAGRAM_ACCESS_TOKEN in .env

require('dotenv').config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('❌ Missing INSTAGRAM_ACCESS_TOKEN in .env');
  console.error('   Run: node get-token.js YOUR_SHORT_TOKEN');
  process.exit(1);
}

async function getIds() {
  try {
    // Step 1: Get all Facebook Pages linked to this user
    console.log('🔍 Fetching your Facebook Pages...');
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${TOKEN}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      console.error('❌ Error:', pagesData.error.message);
      process.exit(1);
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('❌ No Facebook Pages found. Create a Page first and connect it to Instagram.');
      process.exit(1);
    }

    const page = pagesData.data[0]; // first page
    console.log('✅ Found Page:', page.name, '(ID:', page.id + ')');

    // Step 2: Get Instagram Business Account ID from this page
    console.log('🔍 Fetching Instagram Business Account ID...');
    const igUrl = `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${TOKEN}`;
    const igRes = await fetch(igUrl);
    const igData = await igRes.json();

    if (igData.error) {
      console.error('❌ Error:', igData.error.message);
      process.exit(1);
    }

    if (!igData.instagram_business_account) {
      console.error('❌ No Instagram Business Account linked to this Page.');
      console.error('   Go to Instagram → Settings → Business → Connect to Facebook Page');
      process.exit(1);
    }

    const igId = igData.instagram_business_account.id;
    console.log('✅ Instagram Business Account ID:', igId);

    // Step 3: Get account details
    console.log('🔍 Fetching account details...');
    const accountUrl = `https://graph.facebook.com/v18.0/${igId}?fields=username,name,media_count&access_token=${TOKEN}`;
    const accountRes = await fetch(accountUrl);
    const accountData = await accountRes.json();

    if (accountData.username) {
      console.log('✅ Username:', accountData.username);
    }
    if (accountData.name) {
      console.log('✅ Display Name:', accountData.name);
    }
    if (accountData.media_count !== undefined) {
      console.log('✅ Media Count:', accountData.media_count);
    }

    // Update .env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(
      /INSTAGRAM_USER_ID=.*/,
      `INSTAGRAM_USER_ID=${igId}`
    );
    fs.writeFileSync(envPath, envContent);

    console.log('');
    console.log('✅ .env file updated with INSTAGRAM_USER_ID!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   Page ID:', page.id);
    console.log('   IG User ID:', igId);
    console.log('   Username:', accountData.username || '(unknown)');

  } catch (err) {
    console.error('❌ Network error:', err.message);
    process.exit(1);
  }
}

getIds();
