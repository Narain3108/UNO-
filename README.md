# UNO Multiplayer Game

A complete multiplayer UNO card game that runs in the browser and allows you to play with friends over the internet.

## Features

- 🎮 **Full UNO Game Logic**: Complete implementation of standard UNO rules
- 🌐 **Real-time Multiplayer**: Play with 2-8 players using Socket.IO
- 🎨 **Beautiful UI**: Modern, colorful design with Tailwind CSS
- 💬 **Chat System**: In-game chat for players
- 🔊 **Sound Effects**: Audio feedback for card plays and UNO declarations
- 🎯 **Server Authoritative**: All game logic validated on the server to prevent cheating

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Package Manager**: npm

## Project Structure

```
uno/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Socket)
│   │   └── ...
│   └── package.json
├── backend/           # Node.js backend server
│   ├── game/          # Game engine logic
│   │   ├── GameEngine.js
│   │   └── RoomManager.js
│   ├── server.js      # Express + Socket.IO server
│   └── package.json
├── package.json       # Root package.json with dev scripts
└── README.md
```

## Installation

1. **Install all dependencies** (from project root):
   ```bash
   npm run install:all
   ```

   Or manually:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Running the Application

### Option 1: Run Everything Together (Recommended)

From the project root:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend dev server (port 5173) concurrently.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## How to Play

1. **Start the servers** using `npm run dev` from the project root
2. **Open your browser** and navigate to `http://localhost:5173`
3. **Enter your name** and either:
   - Click "Create Room" to create a new game room
   - Enter a room code and click "Join Room" to join an existing game
4. **Share the room code** with your friends (they need to be on the same network or use port forwarding/ngrok for internet play)
5. **Click "Start Game"** once 2-8 players have joined
6. **Play UNO!** Click cards to play them, use the Draw button when needed, and declare UNO when you have one card left

## Game Rules

- Each player starts with 7 cards
- Match the top card on the discard pile by color, number, or symbol
- Special cards:
  - **Skip** (⛔): Next player loses their turn
  - **Reverse** (🔄): Reverses play direction (acts as Skip in 2-player games)
  - **Draw Two** (+2): Next player draws 2 cards
  - **Wild** (🎨): Choose any color
  - **Wild Draw Four** (+4): Choose any color, next player draws 4 cards
- If you can't play, you must draw a card
- Declare "UNO" when you have one card left
- First player to play all cards wins!

## Development

### Backend Port
- Default: `3001`
- Change via `PORT` environment variable

### Frontend Port
- Default: `5173` (Vite default)
- Configured in `frontend/vite.config.js`

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

**Backend:**
```bash
cd backend
npm start
```

## Notes

- The game requires all players to be connected to the same server
- For internet play, you'll need to deploy the backend or use a tunneling service like ngrok
- Game state is managed server-side for security and consistency
- The frontend connects to `http://localhost:3001` by default - update `frontend/src/contexts/SocketContext.jsx` if your backend is hosted elsewhere

## License

MIT
