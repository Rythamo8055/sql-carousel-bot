# 🚀 Instagram Automation — Quick Setup

## Step 1: Copy .env.example to .env
```bash
cp .env.example .env
```

## Step 2: Fill in the 4 keys (see exact locations below)

| Key | Where to find it |
|-----|-------------------|
| `INSTAGRAM_APP_ID` | developers.facebook.com → My Apps → Your App → Dashboard (left card) |
| `INSTAGRAM_APP_SECRET` | Same app → Settings → Basic → App Secret → Show |
| `INSTAGRAM_ACCESS_TOKEN` | Run `node get-token.js` — it generates a long-lived token for you |
| `INSTAGRAM_USER_ID` | Run `node get-ids.js` — it prints your IG Business Account ID |

## Step 3: Get your token and IDs
```bash
node get-token.js    # → generates long-lived token
node get-ids.js      # → prints your Instagram User ID
```
Copy the outputs into your `.env` file.

## Step 4: Test everything
```bash
node test-connection.js
```
You should see: `Connection successful!` + your username + media count.

## Step 5: Post a test carousel
```bash
node publish-carousel.js
```
Check Instagram — a test post should appear. Delete it after confirming.

## Step 6: Start automating
Put your carousel images in a public URL (GitHub Pages, R2, Vercel).
Then edit `publish-carousel.js` with your real image URLs and captions.
Or use the daily queue: `node post-day.js 1` (posts Day 1 content)
