import Card from './Card';

const GameBoard = ({
  gameState,
  myHand,
  isMyTurn,
  onCardClick,
  onDrawCard,
  onDeclareUno,
  canDeclareUno,
  socketId,
  players
}) => {
  const topCard = gameState?.topDiscardCard;
  const pendingDraw = gameState?.pendingDraw || 0;
  const gameOver = gameState?.gameOver;
  const winner = gameState?.winner;
  const winnerName = winner ? players.find(p => p.id === winner)?.name || 'Unknown' : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Game Over Screen */}
      {gameOver && (
        <div className="text-center mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
          <h2 className="text-4xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-2xl text-white">{winnerName} Wins! 🎉</p>
        </div>
      )}

      {/* Discard Pile */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Discard Pile</h3>
          {topCard ? (
            <div className="relative">
              <Card card={topCard} size="large" />
              {gameState?.chosenColor && (topCard.type === 'wild' || topCard.type === 'wild4') && (
                <div className="mt-2 text-sm text-gray-600">
                  Color: <span className="font-semibold capitalize">{gameState.chosenColor}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No card</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Draw Indicator */}
      {pendingDraw > 0 && isMyTurn && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
          <p className="text-lg font-semibold text-yellow-800">
            You must draw {pendingDraw} card{pendingDraw > 1 ? 's' : ''} or play a matching card!
          </p>
        </div>
      )}

      {/* Turn Indicator */}
      {!gameOver && (
        <div className="mb-6 text-center">
          <div className={`inline-block px-4 py-2 rounded-lg ${
            isMyTurn ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'
          }`}>
            <p className={`font-semibold ${
              isMyTurn ? 'text-green-800' : 'text-gray-600'
            }`}>
              {isMyTurn ? '🎯 Your Turn' : `Waiting for ${players.find(p => p.id === gameState?.currentPlayerId)?.name || 'player'}...`}
            </p>
          </div>
        </div>
      )}

      {/* Draw Pile */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Draw Pile</h3>
          <div className="relative">
            <div className="w-32 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg flex items-center justify-center cursor-pointer transform transition-transform hover:scale-105 border-4 border-white"
              onClick={isMyTurn ? onDrawCard : undefined}
            >
              <span className="text-white text-2xl font-bold">
                {gameState?.drawPileCount || 0}
              </span>
            </div>
            {isMyTurn && (
              <button
                onClick={onDrawCard}
                className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Draw Card
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Hand ({myHand.length} cards)</h3>
        <div className="flex flex-wrap gap-2 justify-center min-h-[200px] items-end">
          {myHand.map((card, index) => (
            <div
              key={index}
              className={`transform transition-all cursor-pointer ${
                isMyTurn && !pendingDraw ? 'hover:-translate-y-4 hover:scale-110' : ''
              } ${!isMyTurn ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => isMyTurn && !pendingDraw && onCardClick(index)}
            >
              <Card card={card} />
            </div>
          ))}
        </div>

        {/* UNO Button */}
        {canDeclareUno && isMyTurn && (
          <div className="mt-4 text-center">
            <button
              onClick={onDeclareUno}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg font-bold text-xl hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              UNO!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
