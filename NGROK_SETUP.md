# Ngrok Setup Guide

Ngrok allows you to expose your local server to the internet, making it possible to play with friends remotely.

## Option 1: Using ngrok npm package (Recommended, no global installs)

### Step 1: Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Start the backend server (port 3001)
```bash
npm run dev
```

### Step 3: In a new terminal, start ngrok tunnel for backend (port 3001)
```bash
cd backend
npm run ngrok
```

You'll see output like:
```
🌐 Ngrok tunnel established!
📡 Public URL: https://abc123.ngrok.io
🔗 Backend accessible at: https://abc123.ngrok.io
```

### Step 4: Update frontend to use backend ngrok URL

**Method A: Environment Variable (Recommended)**
1. Create `frontend/.env` file:
```env
VITE_BACKEND_URL=https://your-ngrok-url.ngrok.io
```
2. Restart the frontend dev server

**Method B: Browser Console**
1. Open browser console (F12)
2. Run:
```javascript
localStorage.setItem('ngrok_url', 'https://your-ngrok-url.ngrok.io');
location.reload();
```

### Step 5 (recommended for friends): Start ngrok tunnel for frontend (port 5173)

In a new terminal:
```bash
cd frontend
npm run dev
```

In another terminal:
```bash
cd frontend
npm run ngrok
```

Share the **frontend ngrok URL** with your friends. They open it in a browser.

## Option 2: Using ngrok CLI (More Control)

### Step 1: Download ngrok
1. Go to https://ngrok.com/download
2. Download and extract ngrok
3. (Optional) Sign up for free account to get persistent URLs

### Step 2: Start backend server
```bash
cd backend
npm run dev
```

### Step 3: Start ngrok tunnel
```bash
ngrok http 3001
```

### Step 4: Copy the forwarding URL
You'll see something like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3001
```

### Step 5: Update frontend (same as Option 1, Step 4)

## Sharing with Friends

There are two ways:

### A) Friends run frontend locally (simpler for you)
1. You run backend + ngrok tunnel for backend.
2. Share your **backend ngrok URL** with friends.
3. Friends create `frontend/.env`:
   - `VITE_BACKEND_URL=https://your-backend.ngrok-free.app`
4. Friends run `cd frontend && npm run dev` and open `http://localhost:5173`.

### B) Friends open a URL in browser (recommended for non-technical friends)
1. You run backend + ngrok tunnel for backend.
2. You set `frontend/.env` with `VITE_BACKEND_URL=<backend ngrok url>` and restart frontend dev server.
3. You run ngrok tunnel for frontend (`cd frontend && npm run ngrok`).
4. Share the **frontend ngrok URL** with friends. They open it in a browser.

## Important Notes

⚠️ **Free ngrok URLs change every time** you restart ngrok (unless you have a paid account)

⚠️ **Security**: Ngrok exposes your local server to the internet. Only use for development/testing.

⚠️ **Performance**: There may be slight latency compared to localhost.

## Troubleshooting

### Connection still fails
- Make sure backend is running (`npm run dev` in backend folder)
- Check that ngrok tunnel is active
- Verify the URL in frontend matches ngrok URL exactly
- Check browser console for CORS errors

### Ngrok URL keeps changing
- Sign up for free ngrok account at https://ngrok.com
- Get authtoken from dashboard
- Set `NGROK_AUTH_TOKEN` environment variable
- Or use paid plan for static domains

### Friends can't connect
- Make sure they're using the same ngrok URL
- Check that ngrok tunnel is still running
- Verify firewall isn't blocking connections

## Quick Test

After setting up ngrok, test the connection:
1. Open browser console
2. Run: `fetch('https://your-ngrok-url.ngrok.io')`
3. Should get a response (even if it's an error, that means server is reachable)
