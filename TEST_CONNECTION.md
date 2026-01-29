# Connection Troubleshooting Guide

## Step 1: Verify Backend is Running

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📡 Socket.IO server ready for connections
🌐 CORS enabled for: http://localhost:5173
```

If you see errors, make sure:
- Node.js is installed (`node --version`)
- Dependencies are installed (`npm install` in backend folder)
- Port 3001 is not already in use

## Step 2: Verify Frontend is Running

In another terminal:
```bash
cd frontend
npm run dev
```

Or from root:
```bash
npm run dev
```

You should see Vite starting on port 5173.

## Step 3: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab**: Look for connection messages
2. **Network tab**: Check if Socket.IO is connecting
3. Look for any CORS errors

## Step 4: Test Backend Directly

Open browser and go to: `http://localhost:3001`

You should see an error (that's normal - there's no HTTP route), but it confirms the server is running.

## Common Issues:

1. **Backend not running**: Start it with `cd backend && npm run dev`
2. **Port already in use**: Change PORT in backend/server.js or kill the process using port 3001
3. **Firewall blocking**: Check Windows Firewall settings
4. **Wrong URL**: Make sure frontend is connecting to `http://localhost:3001` (not https)

## Quick Test:

Run this in browser console when on the frontend page:
```javascript
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!', socket.id));
socket.on('connect_error', (err) => console.error('Error:', err));
```

If this works, the issue is in the React code. If not, it's a server/network issue.
