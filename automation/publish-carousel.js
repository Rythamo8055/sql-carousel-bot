// ============================================================
// publish-carousel.js
// Publishes a carousel post to Instagram via Graph API
// ============================================================
// Usage: node publish-carousel.js
// Requires: INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID in .env
//           + publicly accessible JPG image URLs

require('dotenv').config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

if (!TOKEN || !USER_ID) {
  console.error('❌ Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID in .env');
  process.exit(1);
}

// ============================================================
// EDIT THIS: Your carousel slides (JPG URLs, max 10 slides)
// ============================================================
const SLIDES = [
  'https://your-domain.com/day1-slide1.jpg',
  'https://your-domain.com/day1-slide2.jpg',
  'https://your-domain.com/day1-slide3.jpg',
];

const CAPTION = 'Day 1: SQL Basics — SELECT, WHERE, ORDER BY 📊\n\nSave this if you found it helpful!\n\n#SQL #LearnToCode #DevTips #Programming #30DayChallenge';

// ============================================================
// PUBLISH LOGIC (no changes needed below)
// ============================================================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createContainer(imageUrl) {
  const url = `https://graph.facebook.com/v18.0/${USER_ID}/media?` +
    `image_url=${encodeURIComponent(imageUrl)}&` +
    `access_token=${TOKEN}`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    throw new Error(`Container creation failed: ${data.error.message}`);
  }

  return data.id;
}

async function createCarousel(containerIds, caption) {
  const url = `https://graph.facebook.com/v18.0/${USER_ID}/media?` +
    `children=${containerIds.join(',')}&` +
    `media_type=CAROUSEL&` +
    `caption=${encodeURIComponent(caption)}&` +
    `access_token=${TOKEN}`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    throw new Error(`Carousel creation failed: ${data.error.message}`);
  }

  return data.id;
}

async function publish(carouselId) {
  const url = `https://graph.facebook.com/v18.0/${USER_ID}/media_publish?` +
    `creation_id=${carouselId}&` +
    `access_token=${TOKEN}`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    throw new Error(`Publish failed: ${data.error.message}`);
  }

  return data.id;
}

async function addComment(mediaId, text) {
  const url = `https://graph.facebook.com/v18.0/${mediaId}/comments?` +
    `text=${encodeURIComponent(text)}&` +
    `access_token=${TOKEN}`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();

  if (data.error) {
    console.log('⚠️  Comment failed (non-critical):', data.error.message);
    return null;
  }

  return data.id;
}

async function main() {
  console.log('📸 Publishing carousel to Instagram...');
  console.log(`   Slides: ${SLIDES.length}`);
  console.log('');

  // Step 1: Create containers for each slide
  const containerIds = [];
  for (let i = 0; i < SLIDES.length; i++) {
    console.log(`   Creating container ${i + 1}/${SLIDES.length}...`);
    const id = await createContainer(SLIDES[i]);
    containerIds.push(id);
    console.log(`   ✅ Container: ${id}`);
    await sleep(1000); // rate limit safety
  }

  // Step 2: Create carousel container
  console.log('');
  console.log('   Creating carousel container...');
  const carouselId = await createCarousel(containerIds, CAPTION);
  console.log(`   ✅ Carousel: ${carouselId}`);

  // Step 3: Wait for Instagram to process
  console.log('');
  console.log('   Waiting 10s for Instagram to process...');
  await sleep(10000);

  // Step 4: Publish
  console.log('   Publishing...');
  const postId = await publish(carouselId);
  console.log(`   ✅ Published! Post ID: ${postId}`);

  // Step 5: Auto-comment (Day X of 30)
  console.log('');
  console.log('   Adding first comment...');
  await addComment(postId, 'Day 1 of 30 — SQL Basics 📊 Save this series!');
  console.log('   ✅ Comment added');

  console.log('');
  console.log('🎉 DONE! Check your Instagram: https://instagram.com/' + process.env.INSTAGRAM_USERNAME);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
