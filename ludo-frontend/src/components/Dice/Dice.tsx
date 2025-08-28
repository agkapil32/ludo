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
const DWELL_MS = 800; // minimum time to keep final face visible
const MIN_ROLL_MS = 800; // minimum rolling animation duration

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

  // Refs for lifecycle control
  const lastRollIdRef = useRef<string | null>(null);
  const rollingIntervalRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const dwellTimeoutRef = useRef<number | null>(null);
  const lastFaceShownAtRef = useRef<number | null>(null);
  const rollStartAtRef = useRef<number | null>(null);
  const finalizeTimeoutRef = useRef<number | null>(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ENHANCED: Simplified dice data with sequential usage tracking
  const diceData = useMemo(() => {
    const rolls = gameState?.currentDiceRolls || [];
    const latestRoll = rolls[rolls.length - 1];

    // Track which dice are used in order for visual feedback
    const usedCount = rolls.filter(r => r.isUsed).length;
    const totalCount = rolls.length;
    const nextUnusedIndex = rolls.findIndex(r => !r.isUsed);

    return {
      currentDiceRolls: rolls,
      latestRoll,
      hasRolls: rolls.length > 0,
      lastDiceRoll: (gameState as any)?.lastDiceRoll || null,
      usedCount,
      totalCount,
      nextUnusedIndex,
      sequentialProgress: totalCount > 0 ? (usedCount / totalCount) * 100 : 0
    };
  }, [gameState?.currentDiceRolls, (gameState as any)?.lastDiceRoll]);

  // ENHANCED: Stricter turn validation
  const isMyTurn = useMemo(() => {
    const currentPlayerName = localStorage.getItem('currentPlayerName');
    if (!gameState || !currentPlayerName) return false;

    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    return currentPlayer?.name === currentPlayerName;
  }, [gameState]);

  // FIXED: Proper Ludo dice rolling validation - allow rolling again after 6
  const canRollDice = useMemo(() => {
    if (!isMyTurn || isRolling || animationState.isAnimating) {
      return false;
    }

    const rolls = gameState?.currentDiceRolls || [];

    // If no dice rolled yet, player can roll
    if (rolls.length === 0) {
      return true;
    }

    // Check the latest roll
    const latestRoll = rolls[rolls.length - 1];

    // CRITICAL LUDO RULE: If latest roll is a 6, player can roll again immediately
    if (latestRoll && latestRoll.move === 6 && !latestRoll.isUsed) {
      return true; // Can roll again after getting a 6, even before using it
    }

    // For non-6 rolls: must use all dice before rolling again
    const hasUnusedNonSixDice = rolls.some(roll => !roll.isUsed && roll.move !== 6);
    if (hasUnusedNonSixDice) {
      return false; // Must use non-6 dice before rolling again
    }

    // All dice are used, can roll again
    return true;
  }, [isMyTurn, isRolling, animationState.isAnimating, gameState?.currentDiceRolls]);

  // Helper to finalize a roll and show the final face
  const finalizeRoll = useCallback((rollValue: number, currentRollId: string) => {
    if (rollingIntervalRef.current) {
      window.clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (dwellTimeoutRef.current) {
      window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = null;
    }

    lastFaceShownAtRef.current = Date.now();

    setAnimationState(prev => ({
      ...prev,
      isAnimating: false,
      currentFace: rollValue,
      finalValue: rollValue,
      lastProcessedRoll: currentRollId
    }));
  }, []);

  // Stop rolling and show final value from DTO whenever a new dice result arrives, but honor MIN_ROLL_MS
  useEffect(() => {
    if (!diceData.latestRoll) return;

    const rollValue = diceData.latestRoll.move;
    const currentRollId = `${rollValue}-${diceData.currentDiceRolls.length}-${gameState?.currentPlayerIndex}`;

    if (currentRollId === lastRollIdRef.current) return;

    lastRollIdRef.current = currentRollId;

    const now = Date.now();
    const startedAt = rollStartAtRef.current ?? now;
    const elapsed = now - startedAt;
    const remainingRoll = Math.max(0, MIN_ROLL_MS - elapsed);

    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    if (remainingRoll > 0) {
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeRoll(rollValue, currentRollId);
        finalizeTimeoutRef.current = null;
      }, remainingRoll);
    } else {
      finalizeRoll(rollValue, currentRollId);
    }
  }, [diceData.latestRoll?.move, diceData.currentDiceRolls.length, gameState?.currentPlayerIndex, finalizeRoll]);

  // Fallback: if backend cleared currentDiceRolls due to turn change but provided lastDiceRoll, use it to finalize
  useEffect(() => {
    if (diceData.latestRoll || !diceData.lastDiceRoll) return;

    const { move, playerIndex, timestamp, rollId } = diceData.lastDiceRoll;
    const currentRollId = `last-${move}-${playerIndex}-${timestamp ?? ''}-${rollId ?? ''}`;

    if currentRollId === lastRollIdRef.current) return;
    lastRollIdRef.current = currentRollId;

    const now = Date.now();
    const startedAt = rollStartAtRef.current ?? now;
    const elapsed = now - startedAt;
    const remainingRoll = Math.max(0, MIN_ROLL_MS - elapsed);

    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    if (remainingRoll > 0) {
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeRoll(move, currentRollId);
        finalizeTimeoutRef.current = null;
      }, remainingRoll);
    } else {
      finalizeRoll(move, currentRollId);
    }
  }, [diceData.latestRoll, diceData.lastDiceRoll, finalizeRoll]);

  // Helper to apply the UI reset for a new turn
  const applyTurnReset = useCallback(() => {
    if (rollingIntervalRef.current) {
      window.clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (dwellTimeoutRef.current) {
      window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = null;
    }
    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    lastRollIdRef.current = null;
    lastFaceShownAtRef.current = null;
    rollStartAtRef.current = null;

    // Read latest dice for current player safely
    const gs = gameStateRef.current;
    const rolls = gs?.currentDiceRolls ?? [];
    const nextFace: number | '?' = rolls.length ? rolls[rolls.length - 1].move : '?';

    setAnimationState({
      isAnimating: false,
      currentFace: nextFace,
      finalValue: typeof nextFace === 'number' ? nextFace : null,
      lastProcessedRoll: null
    });
  }, []);

  // Stop animation and reset markers when the turn changes, respecting both MIN_ROLL_MS and DWELL_MS
  useEffect(() => {
    const now = Date.now();

    // If still rolling or finalization is pending, wait for rolling min duration + dwell
    if (animationState.isAnimating || finalizeTimeoutRef.current) {
      const startedAt = rollStartAtRef.current ?? now;
      const remainingRoll = Math.max(0, MIN_ROLL_MS - (now - startedAt));
      if (dwellTimeoutRef.current) window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = window.setTimeout(() => {
        applyTurnReset();
      }, remainingRoll + DWELL_MS);
      return;
    }

    // Otherwise, if we already showed a final face, honor remaining dwell
    const lastShown = lastFaceShownAtRef.current;
    const remainingDwell = lastShown ? Math.max(0, DWELL_MS - (now - lastShown)) : 0;

    if (remainingDwell > 0) {
      if (dwellTimeoutRef.current) window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = window.setTimeout(() => {
        applyTurnReset();
      }, remainingDwell);
    } else {
      applyTurnReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayerIndex]);

  // FIXED: Simplified click handler - let backend handle all validation
  const handleRollClick = useCallback(() => {
    if (!canRollDice) {
      // Only log basic UI state issues, not business rule violations
      console.warn('Cannot roll dice - UI state issue (not turn, already rolling, or animating)');
      return;
    }

    rollStartAtRef.current = Date.now();

    setAnimationState(prev => ({
      ...prev,
      isAnimating: true,
      currentFace: '?',
      finalValue: null
    }));

    // Start rolling animation
    let sequenceIndex = 0;
    rollingIntervalRef.current = window.setInterval(() => {
      setAnimationState(prev => ({
        ...prev,
        currentFace: ANIMATION_SEQUENCE[sequenceIndex % ANIMATION_SEQUENCE.length]
      }));
      sequenceIndex++;
    }, 80);

    // Safety timeout
    safetyTimeoutRef.current = window.setTimeout(() => {
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
        rollingIntervalRef.current = null;
      }
      setAnimationState(prev => ({
        ...prev,
        isAnimating: false,
        currentFace: prev.finalValue || 1
      }));
    }, 5000);

    // Let backend handle all validation - frontend just sends the request
    rollDice().catch(error => {
      console.error('Backend rejected dice roll:', error);
      // Backend will provide appropriate error message via API response
    });
  }, [canRollDice, rollDice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
      }
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
      }
      if (dwellTimeoutRef.current) {
        window.clearTimeout(dwellTimeoutRef.current);
      }
      if (finalizeTimeoutRef.current) {
        window.clearTimeout(finalizeTimeoutRef.current);
      }
    };
  }, []);

  // ✅ SIMPLIFIED: UI state based on DTO data only
  const uiState = useMemo(() => {
    const rolls = diceData.currentDiceRolls;
    const hasRolls = diceData.hasRolls;

    let statusMessage = "🎯 Click to roll the dice and start your turn!";
    let buttonText = "🎲 Roll Dice";

    // SIMPLIFIED: Only check basic UI state, not complex business rules
    if (!isMyTurn) {
      statusMessage = "⏳ Wait for your turn to roll the dice";
      buttonText = "🚫 Not Your Turn";
    } else if (animationState.isAnimating) {
      statusMessage = "🎲 Rolling the dice...";
      buttonText = "🎲 Rolling...";
    } else if (isRolling) {
      statusMessage = "🔄 Processing roll...";
      buttonText = "🔄 Processing...";
    } else if (hasRolls) {
      // Show encouraging message but let backend decide if more rolls are allowed
      const latestRoll = rolls[rolls.length - 1];
      if (latestRoll?.move === 6) {
        statusMessage = "🎉 You rolled a 6! You can roll again or move a token.";
        buttonText = "🎲 Roll Again";
      } else {
        statusMessage = "✅ Dice rolled. Select a token to move or roll again if allowed.";
        buttonText = "🎲 Roll Dice";
      }
    }

    // SIMPLIFIED: Basic UI state check only
    const canRoll = canRollDice; // This is now just isMyTurn && !isRolling && !animating

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
  }, [diceData, animationState, isRolling, isMyTurn, canRollDice]);

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

        {/* Roll Button - FIXED: Use correct handler name */}
        <button
          onClick={handleRollClick}
          disabled={!uiState.canRoll}
          className={uiState.buttonClassName}
          aria-label="Roll dice"
        >
          {uiState.buttonText}
        </button>

        {/* Status Display */}
        <div className={uiState.statusClassName} role="status" aria-live="polite">
          {uiState.statusMessage}
        </div>

        {/* ENHANCED: Always show dice usage status for current player */}
        {diceData.hasRolls && (
          <div className="current-dice-display">
            <h4>🎲 Dice Rolls This Turn</h4>

            {/* Example: Show "6, 6, 2" with clear usage indicators */}
            <div className="dice-results-overview">
              <h5>Rolled: {diceData.currentDiceRolls.map(r => r.move).join(', ')}</h5>
            </div>

            <div className="dice-results-grid">
              {diceData.currentDiceRolls.map((roll, index) => (
                <div
                  key={index}
                  className={`dice-result-item ${roll.isUsed ? 'used' : 'available'} ${index === diceData.nextUnusedIndex ? 'next-to-use' : ''}`}
                >
                  <DiceFace
                    value={roll.move}
                    size="small"
                  />
                  <span className="roll-number">Roll #{index + 1}</span>
                  <span className={`usage-status ${roll.isUsed ? 'used' : 'available'}`}>
                    {roll.isUsed ? '✅ USED' : index === diceData.nextUnusedIndex ? '🎯 NEXT TO USE' : '⏳ AVAILABLE'}
                  </span>

                  {/* Show when this dice was used */}
                  {roll.isUsed && (
                    <span className="used-timestamp">
                      Used in move
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced progress bar showing usage */}
            <div className="dice-progress-section">
              <div className="dice-progress-bar">
                <div
                  className="dice-progress-fill"
                  style={{ width: `${diceData.sequentialProgress}%` }}
                />
              </div>
              <div className="dice-progress-text">
                Progress: {diceData.usedCount} of {diceData.totalCount} dice used
              </div>
            </div>

            {/* Clear summary of current state */}
            <div className="dice-summary">
              <div className="dice-summary-row">
                <span className="summary-label">🎲 Total Rolls:</span>
                <span className="summary-value">{diceData.currentDiceRolls.length}</span>
              </div>
              <div className="dice-summary-row">
                <span className="summary-label">✅ Used Dice:</span>
                <span className="summary-value">
                  {diceData.currentDiceRolls.filter(roll => roll.isUsed).map(r => r.move).join(', ') || 'None'}
                </span>
              </div>
              <div className="dice-summary-row">
                <span className="summary-label">🎯 Available Dice:</span>
                <span className="summary-value">
                  {diceData.currentDiceRolls.filter(roll => !roll.isUsed).map(r => r.move).join(', ') || 'None'}
                </span>
              </div>
              {diceData.nextUnusedIndex >= 0 && (
                <div className="dice-summary-row highlight">
                  <span className="summary-label">🔄 Next to use:</span>
                  <span className="summary-value next-dice">
                    {diceData.currentDiceRolls[diceData.nextUnusedIndex].move}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show message when no dice are available */}
        {!diceData.hasRolls && isMyTurn && (
          <div className="no-dice-display">
            <p>🎲 No dice rolled yet. Click "Roll Dice" to start!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dice;
