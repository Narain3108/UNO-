import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

const Lobby = ({ onJoinRoom }) => {
  const socket = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError('');
      console.log('Socket connected:', socket.id);
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, try to reconnect
        socket.connect();
      }
    };

    const handleConnectError = (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
      setError(`Failed to connect to server at http://localhost:3001. Make sure the backend is running. Error: ${err.message}`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Check initial connection state
    setIsConnected(socket.connected);
    
    // If not connected, try to connect
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    setIsCreating(true);
    setError('');
    console.log('Creating room for:', playerName.trim());
    socket.emit('createRoom', { playerName: playerName.trim() });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    setIsJoining(true);
    setError('');
    console.log('Joining room:', roomCode.trim().toUpperCase());
    socket.emit('joinRoom', { 
      roomCode: roomCode.trim().toUpperCase(), 
      playerName: playerName.trim() 
    });
  };

  useEffect(() => {
    const handleRoomCreated = ({ roomCode, players, isHost }) => {
      console.log('Room created event received:', roomCode, 'players:', players);
      setIsCreating(false);
      if (roomCode) {
        onJoinRoom(roomCode, playerName.trim());
      } else {
        setError('Failed to create room. Please try again.');
      }
    };

    const handleRoomJoined = ({ roomCode, players, isHost }) => {
      console.log('Room joined event received:', roomCode, 'players:', players);
      setIsJoining(false);
      if (roomCode) {
        onJoinRoom(roomCode, playerName.trim());
      } else {
        setError('Failed to join room. Please try again.');
      }
    };

    const handleJoinError = ({ message }) => {
      setIsJoining(false);
      setError(message);
      console.error('Join error:', message);
    };

    const handleError = ({ message }) => {
      setIsCreating(false);
      setIsJoining(false);
      setError(message || 'An error occurred');
      console.error('Socket error:', message);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('joinError', handleJoinError);
    socket.on('error', handleError);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('joinError', handleJoinError);
      socket.off('error', handleError);
    };
  }, [socket, playerName, onJoinRoom]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          UNO
        </h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={20}
            />
          </div>
        </div>

        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
            <div className="font-semibold mb-1">Connecting to server...</div>
            <div className="text-xs mt-1">
              Backend: {import.meta.env.VITE_BACKEND_URL || localStorage.getItem('ngrok_url') || 'http://localhost:3001'}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || isJoining}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? 'Creating Room...' : 'Create Room'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isCreating || isJoining}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
