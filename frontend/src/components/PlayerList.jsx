const PlayerList = ({ players, gameState, socketId }) => {
  if (!gameState) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Players ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-2 rounded ${
                player.id === socketId ? 'bg-blue-100 font-semibold' : 'bg-gray-50'
              }`}
            >
              {player.name} {player.id === socketId && '(You)'}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Players</h3>
      <div className="space-y-2">
        {players.map((player) => {
          const cardCount = gameState.playerCardCounts[player.id] || 0;
          const isCurrentPlayer = gameState.currentPlayerId === player.id;
          const hasUno = gameState.unoDeclared.includes(player.id);

          return (
            <div
              key={player.id}
              className={`p-3 rounded border-2 transition-all ${
                isCurrentPlayer
                  ? 'bg-green-100 border-green-500'
                  : player.id === socketId
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  player.id === socketId ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {player.name}
                  {player.id === socketId && ' (You)'}
                  {isCurrentPlayer && ' 🎯'}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                </span>
              </div>
              {hasUno && (
                <div className="mt-1 text-xs font-bold text-red-600 animate-pulse">
                  UNO!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;
