import { useState } from 'react';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerName, setPlayerName] = useState('');

  return (
    <SocketProvider>
      <div className="min-h-screen">
        {!roomCode ? (
          <Lobby 
            onJoinRoom={(code, name) => {
              setRoomCode(code);
              setPlayerName(name);
            }}
          />
        ) : (
          <GameRoom 
            roomCode={roomCode} 
            playerName={playerName}
            onLeave={() => setRoomCode(null)}
          />
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
