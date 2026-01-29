const Card = ({ card, size = 'normal' }) => {
  if (!card) return null;

  const width = size === 'large' ? 'w-32' : 'w-20';
  const height = size === 'large' ? 'h-48' : 'h-32';
  const textSize = size === 'large' ? 'text-2xl' : 'text-lg';

  const getCardColor = () => {
    if (card.type === 'wild' || card.type === 'wild4') {
      return card.chosenColor || 'gray';
    }
    return card.color || 'gray';
  };

  const color = getCardColor();
  const bgColor = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    gray: 'bg-gray-500'
  }[color] || 'bg-gray-500';

  const getCardContent = () => {
    if (card.type === 'number') {
      return card.value;
    } else if (card.type === 'skip') {
      return '⛔';
    } else if (card.type === 'reverse') {
      return '🔄';
    } else if (card.type === 'draw2') {
      return '+2';
    } else if (card.type === 'wild') {
      return '🎨';
    } else if (card.type === 'wild4') {
      return '+4';
    }
    return '?';
  };

  const isWild = card.type === 'wild' || card.type === 'wild4';

  return (
    <div
      className={`${width} ${height} ${bgColor} rounded-lg shadow-lg border-4 border-white flex flex-col items-center justify-center text-white font-bold ${textSize} relative transform transition-transform hover:scale-105`}
      style={{
        background: isWild && !card.chosenColor
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 50%, #f5576c 100%)'
          : undefined
      }}
    >
      {/* Card corners */}
      <div className="absolute top-1 left-1 text-xs font-bold">
        {getCardContent()}
      </div>
      <div className="absolute bottom-1 right-1 text-xs font-bold transform rotate-180">
        {getCardContent()}
      </div>

      {/* Center content */}
      <div className="text-center">
        {card.type === 'skip' && <div className="text-4xl">⛔</div>}
        {card.type === 'reverse' && <div className="text-4xl">🔄</div>}
        {card.type === 'draw2' && (
          <div>
            <div className="text-3xl font-bold">+2</div>
            <div className="text-xs mt-1">DRAW</div>
          </div>
        )}
        {card.type === 'wild' && <div className="text-4xl">🎨</div>}
        {card.type === 'wild4' && (
          <div>
            <div className="text-3xl font-bold">+4</div>
            <div className="text-xs mt-1">WILD</div>
          </div>
        )}
        {card.type === 'number' && (
          <div className={`${size === 'large' ? 'text-5xl' : 'text-4xl'} font-bold`}>
            {card.value}
          </div>
        )}
      </div>

      {/* Color indicator for wild cards */}
      {isWild && card.chosenColor && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold capitalize">
          {card.chosenColor}
        </div>
      )}
    </div>
  );
};

export default Card;
