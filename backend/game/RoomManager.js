/**
 * Manages game rooms and player connections
 */
export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room data
  }

  /**
   * Generate a random 6-character room code
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new room
   */
  createRoom(hostId, hostName) {
    let roomCode;
    do {
      roomCode = this.generateRoomCode();
    } while (this.rooms.has(roomCode));

    this.rooms.set(roomCode, {
      code: roomCode,
      hostId,
      players: [{ id: hostId, name: hostName }],
      gameEngine: null,
      createdAt: Date.now()
    });

    return roomCode;
  }

  /**
   * Join an existing room
   */
  joinRoom(roomCode, playerId, playerName) {
    // Make room code case-insensitive
    const normalizedCode = roomCode.toUpperCase();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.gameEngine) {
      return { success: false, message: 'Game already started' };
    }

    if (room.players.length >= 8) {
      return { success: false, message: 'Room is full (max 8 players)' };
    }

    if (room.players.some(p => p.id === playerId)) {
      return { success: false, message: 'Already in this room' };
    }

    room.players.push({ id: playerId, name: playerName });

    return {
      success: true,
      players: room.players.map(p => ({ id: p.id, name: p.name })),
      roomCode: normalizedCode
    };
  }

  /**
   * Get room data
   */
  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  /**
   * Handle player disconnection
   */
  handleDisconnect(playerId) {
    for (const [roomCode, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          this.rooms.delete(roomCode);
        }
        break;
      }
    }
  }
}
