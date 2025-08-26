import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import diceSprite from '../../assets/board/LudoDices2.jpg';
import './Dice.css';

// Constants for better maintainability
const DICE_POSITIONS = { '?': 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 } as const;
const SIZE_CLASSES = {
  small: 'dice-face-small',
  medium: 'dice-face-medium',
  large: 'dice-face-large'
} as const;
const ANIMATION_SEQUENCE = ['?', 1, 3, 5, 2, 4, 6, 1, 4, 2, 5, 3] as const;
const MAX_ROLLS = 3;

interface DiceAnimationState {
  isAnimating: boolean;
  currentFace: number | '?';
  finalValue: number | null;
  lastProcessedRoll: string | null; // Track which roll we've processed
}

interface DiceFaceProps {
  value: number | '?';
  isRolling?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  showValue?: boolean;
}

// Restored original DiceFace component
const DiceFace: React.FC<DiceFaceProps> = ({
  value,
  isRolling = false,
  size = 'medium',
  showValue = true
}) => {
  const spritePosition = DICE_POSITIONS[value as keyof typeof DICE_POSITIONS] || 0;
  const backgroundPositionX = -(spritePosition * (100 / 7));

  const className = useMemo(() => {
    const classes = [
      'dice-face-image',
      SIZE_CLASSES[size],
      isRolling && 'rolling',
      value === 6 && 'six-face',
      value === '?' && 'question-face'
    ].filter(Boolean).join(' ');
    return classes;
  }, [size, isRolling, value]);

  return (
    <div className={className}>
      <div
        className="dice-sprite"
        style={{
          backgroundImage: `url(${diceSprite})`,
          backgroundPosition: `${backgroundPositionX}% 0`,
          backgroundSize: '700% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {value === '?' && <div className="dice-question-overlay">?</div>}
      {typeof value === 'number' && showValue && (
        <div className={`dice-dots-overlay dice-pattern-${value}`}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="dice-dot" />
          ))}
        </div>
      )}
      {value === 6 && <div className="dice-six-glow"></div>}
    </div>
  );
};

const Dice: React.FC = () => {
  const { gameState, rollDice, isRolling } = useGame();
  const [animationState, setAnimationState] = useState<DiceAnimationState>({
    isAnimating: false,
    currentFace: '?',
    finalValue: null,
    lastProcessedRoll: null
  });

  // Track the last roll ID to prevent duplicate state updates
  const lastRollIdRef = useRef<string | null>(null);
  const rollingIntervalRef = useRef<number | null>(null);

  // ✅ SIMPLIFIED: Use DTO data directly, minimal computation
  const diceData = useMemo(() => {
    if (!gameState?.currentDiceRolls) {
      return {
        currentDiceRolls: [],
        latestRoll: null as any,
        hasRolls: false
      };
    }

    const currentDiceRolls = gameState.currentDiceRolls;
    const latestRoll = currentDiceRolls[currentDiceRolls.length - 1];

    return {
      currentDiceRolls,
      latestRoll,
      hasRolls: currentDiceRolls.length > 0
    };
  }, [gameState?.currentDiceRolls]);

  // ✅ HELPER: Check if current user's turn (simple DTO check)
  const isMyTurn = useMemo(() => {
    const currentPlayerName = localStorage.getItem('currentPlayerName');
    return gameState && currentPlayerName
      ? gameState.players[gameState.currentPlayerIndex]?.name === currentPlayerName
      : false;
  }, [gameState]);

  // ✅ SIMPLIFIED: When backend sends a NEW dice result, stop rolling and show final face from sprite
  useEffect(() => {
    if (!diceData.latestRoll) return;

    const rollValue = diceData.latestRoll.move;
    const currentRollId = `${rollValue}-${diceData.currentDiceRolls.length}-${gameState?.currentPlayerIndex}`;

    if (currentRollId === lastRollIdRef.current) return;

    // Mark processed
    lastRollIdRef.current = currentRollId;

    // Stop any running interval animation
    if (rollingIntervalRef.current) {
      window.clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }

    // Show final value immediately using sprite frame
    setAnimationState(prev => ({
      ...prev,
      isAnimating: false,
      currentFace: rollValue,
      finalValue: rollValue,
      lastProcessedRoll: currentRollId
    }));
  }, [diceData.latestRoll?.move, diceData.currentDiceRolls.length, gameState?.currentPlayerIndex]);

  // ✅ SIMPLIFIED: Dice roll handler - use CSS rolling animation + random face shuffle while waiting
  const handleRollDice = useCallback(async () => {
    if (!isMyTurn) {
      alert('❌ It\'s not your turn! Wait for your turn to roll the dice.');
      return;
    }

    try {
      // Start rolling animation (CSS) and randomize face for visual feedback
      setAnimationState(prev => ({ ...prev, isAnimating: true, currentFace: '?' }));

      // Randomize sprite faces while waiting for API (purely visual)
      rollingIntervalRef.current = window.setInterval(() => {
        const next = ANIMATION_SEQUENCE[Math.floor(Math.random() * ANIMATION_SEQUENCE.length)];
        setAnimationState(prev => ({ ...prev, currentFace: next }));
      }, 150);

      // Call the backend API
      await rollDice();

      // The effect above will stop animation and set the final face when gameState updates
    } catch (error) {
      console.error('Failed to roll dice:', error);
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
        rollingIntervalRef.current = null;
      }
      setAnimationState(prev => ({ ...prev, isAnimating: false, currentFace: '?', finalValue: null }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to roll dice';
      alert(`❌ Dice Roll Failed: ${errorMessage}`);
    }
  }, [rollDice, isMyTurn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
      }
    };
  }, []);

  // ✅ SIMPLIFIED: UI state based on DTO data only
  const uiState = useMemo(() => {
    let statusMessage = "🎯 Click to roll the dice and start your turn!";
    let buttonText = "🎲 Roll Dice";

    if (!isMyTurn) {
      statusMessage = "⏳ Wait for your turn to roll the dice";
      buttonText = "🚫 Not Your Turn";
    } else if (animationState.isAnimating) {
      statusMessage = "🎲 Rolling the dice...";
      buttonText = "🎲 Rolling...";
    } else if (isRolling) {
      statusMessage = "🔄 Processing roll...";
      buttonText = "🔄 Processing...";
    } else if (diceData.hasRolls) {
      statusMessage = "✅ Dice rolled. Select a token to move.";
      buttonText = "✅ Move Token";
    }

    // ✅ SIMPLIFIED: Basic roll permission (backend handles complex logic)
    const canRoll = isMyTurn && !isRolling && !animationState.isAnimating;

    const buttonClassName = [
      'roll-button-enhanced',
      !canRoll && 'disabled',
      !isMyTurn && 'not-your-turn',
      animationState.isAnimating && 'rolling'
    ].filter(Boolean).join(' ');

    const statusClassName = [
      'roll-status-enhanced',
      !isMyTurn && 'waiting'
    ].filter(Boolean).join(' ');

    return {
      statusMessage,
      buttonText,
      canRoll,
      buttonClassName,
      statusClassName
    };
  }, [diceData, animationState, isRolling, isMyTurn]);

  // ✅ FIXED: Show dice value from DTO with proper initial state
  const getDiceDisplay = () => {
    // Show rolling animation when isAnimating is true
    if (animationState.isAnimating) {
      return (
        <DiceFace
          value={animationState.currentFace}
          isRolling={true}
          size="large"
          showValue={animationState.currentFace !== '?'}
        />
      );
    }

    // ✅ FIXED: Show "?" when no dice have been rolled, otherwise show latest roll
    let displayValue: number | '?' = '?';

    if (diceData.hasRolls && diceData.latestRoll) {
      displayValue = diceData.latestRoll.move;
    } else if (animationState.finalValue) {
      displayValue = animationState.finalValue;
    }

    return (
      <DiceFace
        value={displayValue}
        size="large"
        isRolling={false}
      />
    );
  };

  return (
    <div className="dice-container">
      {/* Main Dice Display */}
      <div className="dice-main-section">
        <div className="dice-display-area">
          {getDiceDisplay()}
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRollDice}
          disabled={!uiState.canRoll}
          className={uiState.buttonClassName}
        >
          {uiState.buttonText}
        </button>

        {/* Status Display */}
        <div className={uiState.statusClassName}>
          {uiState.statusMessage}
        </div>

        {/* ✅ SIMPLIFIED: Show DTO data directly */}
        {diceData.hasRolls && isMyTurn && (
          <div className="current-dice-display">
            <h4>Available Dice Values This Turn</h4>
            <div className="dice-results-grid">
              {diceData.currentDiceRolls.map((roll, index) => (
                <div key={index} className={`dice-result-item ${roll.isUsed ? 'used' : 'available'}`}>
                  <DiceFace
                    value={roll.move}
                    size="small"
                  />
                  <span className="roll-number">#{index + 1}</span>
                  <span className={`usage-status ${roll.isUsed ? 'used' : 'available'}`}>
                    {roll.isUsed ? '✅ Used' : '🎯 Available'}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ SIMPLIFIED: Basic summary from DTO data */}
            <div className="dice-summary">
              <p>Total Rolls: {diceData.currentDiceRolls.length}</p>
              <p>Available Dice: {diceData.currentDiceRolls.filter(roll => !roll.isUsed).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dice;
