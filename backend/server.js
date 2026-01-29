import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameEngine } from './game/GameEngine.js';
import { RoomManager } from './game/RoomManager.js';

const app = express();
const httpServer = createServer(app);
// Allow CORS from localhost, LAN (http://x.x.x.x:5173), and any ngrok URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  /^http:\/\/\d{1,3}(\.\d{1,3}){3}:5173$/,
  /^https:\/\/.*\.ngrok\.io$/,
  /^https:\/\/.*\.ngrok-free\.app$/,
  /^https:\/\/.*\.ngrok\.app$/,
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn('⚠️  Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new room
  socket.on('createRoom', ({ playerName }) => {
    try {
      if (!playerName || !playerName.trim()) {
        socket.emit('error', { message: 'Player name is required' });
        return;
      }

      const roomCode = roomManager.createRoom(socket.id, playerName.trim());
      const room = roomManager.getRoom(roomCode);
      
      if (!room) {
        socket.emit('error', { message: 'Failed to create room' });
        console.error(`Failed to get room after creation: ${roomCode}`);
        return;
      }

      socket.join(roomCode);
      socket.emit('roomCreated', { 
        roomCode,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        isHost: true
      });
      console.log(`Room created: ${roomCode} by ${playerName}, players:`, room.players.map(p => p.name));
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room: ' + error.message });
    }
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const normalizedCode = roomCode.toUpperCase();
    console.log(`Join attempt: ${playerName} trying to join ${normalizedCode}`);
    const result = roomManager.joinRoom(normalizedCode, socket.id, playerName);
    
    if (result.success) {
      const room = roomManager.getRoom(result.roomCode || normalizedCode);
      socket.join(normalizedCode);
      socket.emit('roomJoined', { 
        roomCode: normalizedCode, 
        players: result.players,
        isHost: room.hostId === socket.id
      });
      
      // If game has started, send current game state
      if (room.gameEngine) {
        socket.emit('gameStarted', {
          gameState: room.gameEngine.getGameState()
        });
      }
      
      // Notify all players in the room (including the joiner)
      io.to(normalizedCode).emit('playerJoined', {
        players: result.players,
        playerName
      });
      console.log(`${playerName} joined room ${normalizedCode}, total players: ${result.players.length}`);
    } else {
      console.log(`Join failed: ${result.message}`);
      socket.emit('joinError', { message: result.message });
    }
  });

  // Get current room state (for when host enters GameRoom)
  socket.on('getRoomState', ({ roomCode }) => {
    const normalizedCode = roomCode.toUpperCase();
    const room = roomManager.getRoom(normalizedCode);
    if (room) {
      socket.emit('roomJoined', {
        roomCode: normalizedCode,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        isHost: room.hostId === socket.id
      });
      console.log(`Room state sent for ${normalizedCode}, players:`, room.players.map(p => p.name));
    } else {
      console.log(`Room not found for getRoomState: ${normalizedCode}`);
    }
  });

  // Start the game
  socket.on('startGame', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    if (room.players.length < 2 || room.players.length > 8) {
      socket.emit('error', { message: 'Need 2-8 players to start' });
      return;
    }

    if (room.gameEngine) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    // Initialize game engine
    room.gameEngine = new GameEngine(room.players.map(p => p.id));
    room.gameEngine.startGame();

    io.to(roomCode).emit('gameStarted', {
      gameState: room.gameEngine.getGameState()
    });
    console.log(`Game started in room ${roomCode}`);
  });

  // Play a card
  socket.on('playCard', ({ roomCode, cardIndex, chosenColor }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || !room.gameEngine) {
      socket.emit('error', { message: 'Game not found or not started' });
      return;
    }

    const result = room.gameEngine.playCard(socket.id, cardIndex, chosenColor);
    
    if (result.success) {
      io.to(roomCode).emit('cardPlayed', {
        gameState: room.gameEngine.getGameState(),
        playerId: socket.id,
        card: result.card
      });
    } else {
      socket.emit('playError', { message: result.message });
    }
  });

  // Draw a card
  socket.on('drawCard', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || !room.gameEngine) {
      socket.emit('error', { message: 'Game not found or not started' });
      return;
    }

    const result = room.gameEngine.drawCard(socket.id);
    
    if (result.success) {
      socket.emit('cardDrawn', {
        gameState: room.gameEngine.getGameState()
      });
      io.to(roomCode).emit('gameStateUpdate', {
        gameState: room.gameEngine.getGameState()
      });
    } else {
      socket.emit('drawError', { message: result.message });
    }
  });

  // Declare UNO
  socket.on('declareUno', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || !room.gameEngine) {
      return;
    }

    const result = room.gameEngine.declareUno(socket.id);
    if (result.success) {
      io.to(roomCode).emit('unoDeclared', {
        playerId: socket.id,
        gameState: room.gameEngine.getGameState()
      });
    }
  });

  // Send chat message
  socket.on('chatMessage', ({ roomCode, message }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      io.to(roomCode).emit('chatMessage', {
        playerName: player.name,
        message,
        timestamp: Date.now()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
// Listen on all interfaces so other devices on your Wi‑Fi can connect
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
});
