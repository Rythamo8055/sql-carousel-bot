// ============================================================
// test-connection.js
// Tests your Instagram API connection with all credentials
// ============================================================
// Usage: node test-connection.js
// Requires: All 4 keys in .env

require('dotenv').config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

if (!TOKEN || !USER_ID) {
  console.error('❌ Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID in .env');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔍 Testing Instagram API connection...');
    console.log('');

    const url = `https://graph.facebook.com/v18.0/${USER_ID}?` +
      `fields=id,username,name,media_count,followers_count&` +
      `access_token=${TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ FAILED:', data.error.message);
      process.exit(1);
    }

    console.log('✅ Connection successful!');
    console.log('');
    console.log('📋 Account Details:');
    console.log('   ID:', data.id);
    console.log('   Username:', data.username);
    console.log('   Name:', data.name);
    console.log('   Media Count:', data.media_count);
    console.log('   Followers:', data.followers_count || '(need instagram_basic permission)');
    console.log('');
    console.log('🚀 Ready to post! Run: node publish-carousel.js');

  } catch (err) {
    console.error('❌ Network error:', err.message);
    process.exit(1);
  }
}

testConnection();
