import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import GameBoard from './GameBoard';
import PlayerList from './PlayerList';
import Chat from './Chat';

const GameRoom = ({ roomCode, playerName, onLeave }) => {
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize players list when component mounts or roomCode changes
    // This handles the case when host creates room and enters GameRoom
    const initializeRoom = () => {
      // Request current room state (for when host first enters)
      socket.emit('getRoomState', { roomCode });
    };

    initializeRoom();

    const handlePlayerJoined = ({ players: updatedPlayers }) => {
      console.log('Player joined, updating players list:', updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleRoomJoined = ({ players: updatedPlayers, isHost }) => {
      console.log('Room joined, players:', updatedPlayers, 'isHost:', isHost);
      setPlayers(updatedPlayers);
      setIsHost(isHost);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('roomJoined', handleRoomJoined);

    socket.on('gameStarted', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('cardPlayed', ({ gameState }) => {
      setGameState(gameState);
      setShowColorPicker(false);
      playSound('cardPlay');
    });

    socket.on('cardDrawn', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('gameStateUpdate', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('unoDeclared', ({ playerId, gameState }) => {
      setGameState(gameState);
      if (playerId !== socket.id) {
        playSound('uno');
      }
    });

    socket.on('playError', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('drawError', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('gameStarted');
      socket.off('cardPlayed');
      socket.off('cardDrawn');
      socket.off('gameStateUpdate');
      socket.off('unoDeclared');
      socket.off('playError');
      socket.off('drawError');
    };
  }, [socket, roomCode]);

  const handleStartGame = () => {
    socket.emit('startGame', { roomCode });
  };

  const handlePlayCard = (cardIndex, chosenColor = null) => {
    socket.emit('playCard', { roomCode, cardIndex, chosenColor });
  };

  const handleDrawCard = () => {
    socket.emit('drawCard', { roomCode });
  };

  const handleDeclareUno = () => {
    socket.emit('declareUno', { roomCode });
    playSound('uno');
  };

  const handleCardClick = (cardIndex) => {
    const hand = gameState?.playerHands[socket.id] || [];
    const card = hand[cardIndex];
    
    if (card && (card.type === 'wild' || card.type === 'wild4')) {
      setSelectedCardIndex(cardIndex);
      setShowColorPicker(true);
    } else {
      handlePlayCard(cardIndex);
    }
  };

  const handleColorSelect = (color) => {
    if (selectedCardIndex !== null) {
      handlePlayCard(selectedCardIndex, color);
      setShowColorPicker(false);
      setSelectedCardIndex(null);
    }
  };

  const playSound = (type) => {
    // Simple sound effect using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'cardPlay') {
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
    } else if (type === 'uno') {
      oscillator.frequency.value = 880;
      oscillator.type = 'square';
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const myHand = gameState?.playerHands[socket.id] || [];
  const isMyTurn = gameState?.currentPlayerId === socket.id;
  const canDeclareUno = myHand.length === 1 && !gameState?.unoDeclared.includes(socket.id);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Room: {roomCode}</h2>
            <p className="text-sm text-gray-600">You: {playerName}</p>
          </div>
          {!gameState && isHost && (
            <button
              onClick={handleStartGame}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Start Game
            </button>
          )}
          <button
            onClick={onLeave}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Leave Room
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {gameState ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Game Board - takes 3 columns */}
            <div className="lg:col-span-3">
              <GameBoard
                gameState={gameState}
                myHand={myHand}
                isMyTurn={isMyTurn}
                onCardClick={handleCardClick}
                onDrawCard={handleDrawCard}
                onDeclareUno={handleDeclareUno}
                canDeclareUno={canDeclareUno}
                socketId={socket.id}
                players={players}
              />
            </div>

            {/* Sidebar - Player List and Chat */}
            <div className="space-y-4">
              <PlayerList
                players={players}
                gameState={gameState}
                socketId={socket.id}
              />
              <Chat roomCode={roomCode} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Waiting for game to start...</p>
            <p className="text-sm text-gray-500">Players: {players.length}/8</p>
          </div>
        )}

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Choose a Color</h3>
              <div className="grid grid-cols-2 gap-4">
                {['red', 'blue', 'green', 'yellow'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-6 py-4 rounded-lg font-semibold text-white transform transition-transform hover:scale-105 ${
                      color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                      color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                      color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                      'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  setSelectedCardIndex(null);
                }}
                className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
