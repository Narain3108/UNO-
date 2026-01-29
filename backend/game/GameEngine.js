/**
 * Core UNO game engine - handles all game logic
 */
export class GameEngine {
  constructor(playerIds) {
    this.playerIds = playerIds;
    this.currentPlayerIndex = 0;
    this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
    this.drawPile = [];
    this.discardPile = [];
    this.playerHands = new Map(); // playerId -> array of cards
    this.unoDeclared = new Set(); // playerIds who declared UNO
    this.gameOver = false;
    this.winner = null;
    this.pendingDraw = 0; // Accumulated draw cards (+2, +4)
    this.chosenColor = null; // For wild cards
  }

  /**
   * Create a standard UNO deck
   */
  createDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const deck = [];

    // Number cards (0-9) - one 0 per color, two 1-9 per color
    colors.forEach(color => {
      deck.push({ type: 'number', color, value: 0 });
      for (let i = 1; i <= 9; i++) {
        deck.push({ type: 'number', color, value: i });
        deck.push({ type: 'number', color, value: i });
      }
    });

    // Action cards - two per color
    colors.forEach(color => {
      // Skip
      deck.push({ type: 'skip', color });
      deck.push({ type: 'skip', color });
      // Reverse
      deck.push({ type: 'reverse', color });
      deck.push({ type: 'reverse', color });
      // Draw Two
      deck.push({ type: 'draw2', color });
      deck.push({ type: 'draw2', color });
    });

    // Wild cards - 4 of each
    for (let i = 0; i < 4; i++) {
      deck.push({ type: 'wild' });
      deck.push({ type: 'wild4' });
    }

    return deck;
  }

  /**
   * Shuffle deck using Fisher-Yates algorithm
   */
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Deal cards to players
   */
  dealCards() {
    this.drawPile = this.shuffleDeck(this.createDeck());
    
    // Deal 7 cards to each player
    this.playerIds.forEach(playerId => {
      const hand = [];
      for (let i = 0; i < 7; i++) {
        hand.push(this.drawPile.pop());
      }
      this.playerHands.set(playerId, hand);
    });

    // Place first card on discard pile (must be a number card)
    let firstCard;
    do {
      if (this.drawPile.length === 0) {
        // Reshuffle if needed
        const topDiscard = this.discardPile.pop();
        this.drawPile = this.shuffleDeck(this.discardPile);
        this.discardPile = [topDiscard];
      }
      firstCard = this.drawPile.pop();
    } while (firstCard.type !== 'number');

    this.discardPile.push(firstCard);
  }

  /**
   * Start the game
   */
  startGame() {
    this.dealCards();
    this.currentPlayerIndex = Math.floor(Math.random() * this.playerIds.length);
    this.gameOver = false;
  }

  /**
   * Get current player ID
   */
  getCurrentPlayer() {
    return this.playerIds[this.currentPlayerIndex];
  }

  /**
   * Move to next player
   */
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.playerIds.length) % this.playerIds.length;
  }

  /**
   * Check if a card can be played
   */
  canPlayCard(card, topDiscardCard) {
    if (!topDiscardCard) return true;

    // Wild cards can always be played
    if (card.type === 'wild' || card.type === 'wild4') {
      return true;
    }

    // If top card is wild, check chosen color
    if (topDiscardCard.type === 'wild' || topDiscardCard.type === 'wild4') {
      return card.color === this.chosenColor;
    }

    // Same color
    if (card.color === topDiscardCard.color) {
      return true;
    }

    // Same type (for action cards)
    if (card.type === topDiscardCard.type) {
      return true;
    }

    // Same number
    if (card.type === 'number' && topDiscardCard.type === 'number' && card.value === topDiscardCard.value) {
      return true;
    }

    return false;
  }

  /**
   * Play a card
   */
  playCard(playerId, cardIndex, chosenColor = null) {
    if (this.gameOver) {
      return { success: false, message: 'Game is over' };
    }

    if (playerId !== this.getCurrentPlayer()) {
      return { success: false, message: 'Not your turn' };
    }

    const hand = this.playerHands.get(playerId);
    if (!hand || cardIndex < 0 || cardIndex >= hand.length) {
      return { success: false, message: 'Invalid card index' };
    }

    const card = hand[cardIndex];
    const topDiscardCard = this.discardPile[this.discardPile.length - 1];

    // Check if card can be played
    if (!this.canPlayCard(card, topDiscardCard)) {
      return { success: false, message: 'Invalid card - cannot play this card' };
    }

    // Wild cards require color choice
    if ((card.type === 'wild' || card.type === 'wild4') && !chosenColor) {
      return { success: false, message: 'Must choose a color for wild card' };
    }

    // Remove card from hand
    hand.splice(cardIndex, 1);
    this.unoDeclared.delete(playerId);

    // Set chosen color for wild cards
    if (card.type === 'wild' || card.type === 'wild4') {
      this.chosenColor = chosenColor;
      card.chosenColor = chosenColor;
    } else {
      this.chosenColor = card.color;
    }

    // Place card on discard pile
    this.discardPile.push(card);

    // Handle special cards
    if (card.type === 'skip') {
      this.nextPlayer();
    } else if (card.type === 'reverse') {
      this.direction *= -1;
      // If only 2 players, reverse acts like skip
      if (this.playerIds.length === 2) {
        this.nextPlayer();
      }
    } else if (card.type === 'draw2') {
      this.pendingDraw += 2;
      this.nextPlayer();
      // Next player must draw or play another draw2
      return { success: true, card, requiresDraw: true };
    } else if (card.type === 'wild4') {
      this.pendingDraw += 4;
      this.nextPlayer();
      return { success: true, card, requiresDraw: true };
    }

    // Check for win
    if (hand.length === 0) {
      this.gameOver = true;
      this.winner = playerId;
      return { success: true, card, gameOver: true };
    }

    // Move to next player
    this.nextPlayer();

    return { success: true, card };
  }

  /**
   * Draw a card
   */
  drawCard(playerId) {
    if (this.gameOver) {
      return { success: false, message: 'Game is over' };
    }

    if (playerId !== this.getCurrentPlayer()) {
      return { success: false, message: 'Not your turn' };
    }

    const hand = this.playerHands.get(playerId);
    
    // Draw pending cards first
    if (this.pendingDraw > 0) {
      for (let i = 0; i < this.pendingDraw; i++) {
        if (this.drawPile.length === 0) {
          this.reshuffleDiscardPile();
        }
        hand.push(this.drawPile.pop());
      }
      this.pendingDraw = 0;
      this.nextPlayer();
      return { success: true, drewPending: true };
    }

    // Draw one card
    if (this.drawPile.length === 0) {
      this.reshuffleDiscardPile();
    }
    hand.push(this.drawPile.pop());

    // Check if drawn card can be played immediately
    const topDiscardCard = this.discardPile[this.discardPile.length - 1];
    const drawnCard = hand[hand.length - 1];
    const canPlay = this.canPlayCard(drawnCard, topDiscardCard);

    if (!canPlay) {
      this.nextPlayer();
    }

    return { success: true, canPlayDrawnCard: canPlay };
  }

  /**
   * Reshuffle discard pile when draw pile is empty
   */
  reshuffleDiscardPile() {
    const topCard = this.discardPile.pop();
    this.drawPile = this.shuffleDeck(this.discardPile);
    this.discardPile = [topCard];
  }

  /**
   * Declare UNO
   */
  declareUno(playerId) {
    const hand = this.playerHands.get(playerId);
    if (hand && hand.length === 1) {
      this.unoDeclared.add(playerId);
      return { success: true };
    }
    return { success: false };
  }

  /**
   * Get game state (sanitized for clients)
   */
  getGameState() {
    const state = {
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: this.getCurrentPlayer(),
      direction: this.direction,
      topDiscardCard: this.discardPile[this.discardPile.length - 1],
      drawPileCount: this.drawPile.length,
      playerHands: {},
      playerCardCounts: {},
      unoDeclared: Array.from(this.unoDeclared),
      gameOver: this.gameOver,
      winner: this.winner,
      pendingDraw: this.pendingDraw,
      chosenColor: this.chosenColor
    };

    // Only send each player their own hand
    this.playerIds.forEach(playerId => {
      const hand = this.playerHands.get(playerId);
      state.playerHands[playerId] = hand || [];
      state.playerCardCounts[playerId] = hand ? hand.length : 0;
    });

    return state;
  }

  /**
   * Get player's hand (for their own view)
   */
  getPlayerHand(playerId) {
    return this.playerHands.get(playerId) || [];
  }
}
