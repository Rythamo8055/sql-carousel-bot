# 📱 Instagram Graph API Setup Guide

## Prerequisites
- Instagram Business or Creator Account
- Facebook Page connected to Instagram
- Meta Developer Account

---

## Step 1: Create Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Select "Business" type
4. Enter app name: "Instagram API"
5. Enter contact email
6. Click "Create App"

---

## Step 2: Add Instagram Graph API

1. In your app dashboard, click "Add Product"
2. Find "Instagram Graph API" and click "Set Up"
3. Go to Settings → Basic
4. Note your **App ID** and **App Secret**

---

## Step 3: Get Access Token

### Option A: Graph API Explorer (Quick Start)

1. Go to Graph API Explorer
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
5. Click "Generate Access Token"
6. Copy the token (expires in 1 hour)

### Option B: Long-Lived Token (Recommended)

Run this script to convert to a long-lived token (60 days):

```javascript
// exchange-token.js
const fetch = require('node-fetch');

const APP_ID = 'your_app_id';
const APP_SECRET = 'your_app_secret';
const SHORT_LIVED_TOKEN = 'your_short_lived_token';

async function exchangeToken() {
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${APP_ID}` +
    `&client_secret=${APP_SECRET}` +
    `&grant_type=fb_exchange_token` +
    `&fb_exchange_token=${SHORT_LIVED_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Long-lived token:', data.access_token);
  console.log('Expires in:', data.expires_in, 'seconds');
  return data.access_token;
}

exchangeToken();
```

Run: `node exchange-token.js`

---

## Step 4: Get User ID

```javascript
// get-user-id.js
const fetch = require('node-fetch');

const ACCESS_TOKEN = 'your_long_lived_token';

async function getUserId() {
  const url = `https://graph.facebook.com/v18.0/me?access_token=${ACCESS_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('User ID:', data.id);
  console.log('Name:', data.name);
  return data.id;
}

getUserId();
```

---

## Step 5: Test API Connection

```javascript
// test-connection.js
const fetch = require('node-fetch');

const ACCESS_TOKEN = 'your_long_lived_token';
const USER_ID = 'your_user_id';

async function testConnection() {
  const url = `https://graph.facebook.com/v18.0/${USER_ID}?` +
    `fields=id,username,media_count&` +
    `access_token=${ACCESS_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Connection successful!');
  console.log('Username:', data.username);
  console.log('Media count:', data.media_count);
  return data;
}

testConnection();
```

---

## Step 6: Publish Carousel Post

```javascript
// publish-carousel.js
const fetch = require('node-fetch');

const ACCESS_TOKEN = 'your_long_lived_token';
const USER_ID = 'your_user_id';

async function publishCarousel() {
  // Step 1: Create media container for each slide
  const slides = [
    { url: 'https://your-cdn.com/slide1.jpg', caption: 'Slide 1 caption' },
    { url: 'https://your-cdn.com/slide2.jpg', caption: 'Slide 2 caption' },
    { url: 'https://your-cdn.com/slide3.jpg', caption: 'Slide 3 caption' },
  ];

  const containers = [];

  for (const slide of slides) {
    const url = `https://graph.facebook.com/v18.0/${USER_ID}/media?` +
      `image_url=${encodeURIComponent(slide.url)}&` +
      `caption=${encodeURIComponent(slide.caption)}&` +
      `access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    containers.push(data.id);
    console.log('Created container:', data.id);
  }

  // Step 2: Create carousel container
  const carouselUrl = `https://graph.facebook.com/v18.0/${USER_ID}/media?` +
    `children=${containers.join(',')}&` +
    `media_type=CAROUSEL&` +
    `caption=${encodeURIComponent('Your carousel caption')}&` +
    `access_token=${ACCESS_TOKEN}`;

  const carouselResponse = await fetch(carouselUrl, { method: 'POST' });
  const carouselData = await carouselResponse.json();
  console.log('Carousel container:', carouselData.id);

  // Step 3: Publish
  const publishUrl = `https://graph.facebook.com/v18.0/${USER_ID}/media_publish?` +
    `creation_id=${carouselData.id}&` +
    `access_token=${ACCESS_TOKEN}`;

  const publishResponse = await fetch(publishUrl, { method: 'POST' });
  const publishData = await publishResponse.json();
  console.log('Published! Post ID:', publishData.id);
  
  return publishData.id;
}

publishCarousel();
```

---

## Step 7: Get Insights

```javascript
// get-insights.js
const fetch = require('node-fetch');

const ACCESS_TOKEN = 'your_long_lived_token';
const USER_ID = 'your_user_id';
const MEDIA_ID = 'your_media_id';

async function getInsights() {
  const url = `https://graph.facebook.com/v18.0/${MEDIA_ID}/insights?` +
    `metric=impressions,reach,engagement,saves,shares&` +
    `access_token=${ACCESS_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Insights:', JSON.stringify(data, null, 2));
  return data;
}

getInsights();
```

---

## Environment Variables

Create a `.env` file:

```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
INSTAGRAM_USER_ID=your_user_id
```

---

## API Limits

| Endpoint | Limit |
|----------|-------|
| **Feed posts** | 50-100/day |
| **Stories** | 100+/day |
| **Carousel slides** | 10 per carousel |
| **Media insights** | 200 requests/user/day |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `OAuthException: Invalid token` | Token expired, generate new one |
| `OAuthException: Permissions denied` | Check required permissions |
| `Invalid image URL` | Ensure URL is publicly accessible |
| `Rate limit exceeded` | Wait 1 hour, reduce request frequency |

---

## Next Steps

1. Set up automated posting with cron jobs
2. Create content scheduling system
3. Build analytics dashboard
4. Set up webhook for real-time updates
