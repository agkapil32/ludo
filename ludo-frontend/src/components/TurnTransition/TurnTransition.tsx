import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import './TurnTransition.css';

interface TurnTransitionProps {
  onTransitionComplete?: () => void;
}

type TransitionType = 'turn-change' | 'phase-change' | 'game-over';

const TurnTransition: React.FC<TurnTransitionProps> = ({ onTransitionComplete }) => {
  const { gameState, isRolling, currentPlayerName } = useGame();
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [transitionType, setTransitionType] = useState<TransitionType>('turn-change');

  const lastPlayerIndexRef = useRef<number | null>(null);

  if (!gameState) return null;

  const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerName === currentPlayer?.name;
  const diceRolls = gameState.currentDiceRolls || [];

  // Derive a basic game phase from available context state
  const gamePhase: 'waiting' | 'rolling' | 'moving' | 'game-over' = gameState.end
    ? 'game-over'
    : isRolling
      ? 'rolling'
      : diceRolls.length > 0
        ? 'moving'
        : 'waiting';

  useEffect(() => {
    if (!gameState) return;

    let message = '';
    let type: TransitionType = 'turn-change';
    let shouldShow = false;

    // Game over transition
    if (gamePhase === 'game-over') {
      const winners = gameState.winners || [];
      if (winners.length > 0) {
        message = `🎉 ${winners.map(w => w.name).join(', ')} won the game!`;
      } else {
        message = '🎉 Game Over! 🎉';
      }
      type = 'game-over';
      shouldShow = true;
    } else {
      // Turn change detection
      if (lastPlayerIndexRef.current !== null && lastPlayerIndexRef.current !== gameState.currentPlayerIndex) {
        if (isMyTurn) {
          message = `🎯 Your Turn, ${currentPlayerName}!`;
        } else {
          message = `⏳ ${currentPlayer?.name || 'Player'}'s Turn`;
        }
        type = 'turn-change';
        shouldShow = true;
      } else {
        // Phase change hints
        switch (gamePhase) {
          case 'rolling':
            message = '🎲 Rolling Phase - Click to roll dice!';
            type = 'phase-change';
            shouldShow = true;
            break;
          case 'moving':
            message = '🚀 Moving Phase - Select a token to move!';
            type = 'phase-change';
            shouldShow = true;
            break;
          default:
            break;
        }
      }
    }

    lastPlayerIndexRef.current = gameState.currentPlayerIndex;

    if (shouldShow) {
      setTransitionMessage(message);
      setTransitionType(type);
      setShowTransition(true);

      const duration = type === 'game-over' ? 5000 : type === 'turn-change' ? 3000 : 2000;
      const timer = setTimeout(() => {
        setShowTransition(false);
        onTransitionComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [gameState, gamePhase, isMyTurn, currentPlayerName, currentPlayer, onTransitionComplete]);

  if (!showTransition) return null;

  return (
    <div className={`turn-transition-overlay ${transitionType}`}>
      <div className="turn-transition-content">
        <div className="turn-transition-message">
          {transitionMessage}
        </div>

        {transitionType === 'turn-change' && gameState && (
          <div className="player-info">
            <div className={`player-indicator ${gameState.players?.[gameState.currentPlayerIndex]?.color || 'blue'}`}>
              {gameState.players?.[gameState.currentPlayerIndex]?.name || 'Player'}
            </div>
          </div>
        )}

        {transitionType === 'game-over' && (
          <div className="game-over-details">
            <div className="confetti">🎊 🎉 🎊 🎉 🎊</div>
            <button
              className="play-again-button"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurnTransition;
