import React from 'react';
import { useGame } from '../../context/GameContext';
import './Dice.css';

const Dice: React.FC = () => {
  const { gameState, rollDice, isRolling } = useGame();

  if (!gameState) return null;

  const currentDiceRolls = gameState.currentDiceRolls || [];
  const consecutiveSixes = currentDiceRolls.filter(roll => roll.value === 6).length;

  // Dice face components using dots
  const DiceFace: React.FC<{ value: number; isRolling?: boolean }> = ({ value, isRolling }) => {
    const getDots = (num: number) => {
      const dotPatterns = {
        1: [5], // center
        2: [1, 9], // top-left, bottom-right
        3: [1, 5, 9], // diagonal
        4: [1, 3, 7, 9], // corners
        5: [1, 3, 5, 7, 9], // corners + center
        6: [1, 3, 4, 6, 7, 9] // two columns
      };
      return dotPatterns[num as keyof typeof dotPatterns] || [];
    };

    return (
      <div className={`dice-face ${isRolling ? 'rolling' : ''} ${value === 6 ? 'six-face' : ''}`}>
        <div className="dice-dots">
          {Array.from({length: 9}, (_, i) => (
            <div
              key={i}
              className={`dot ${getDots(value).includes(i + 1) ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="dice-number">{value}</div>
      </div>
    );
  };

  const getRollStatusMessage = () => {
    if (consecutiveSixes === 3) {
      return "Three sixes! Turn ended automatically.";
    }
    if (currentDiceRolls.length === 0) {
      return "Click to roll the dice";
    }
    const lastRoll = currentDiceRolls[currentDiceRolls.length - 1];
    if (lastRoll.value === 6 && currentDiceRolls.length < 3) {
      return "You rolled a 6! Click to roll again.";
    }
    return "Dice rolled. You can now move tokens.";
  };

  const getButtonText = () => {
    if (isRolling) return "Rolling...";
    return "🎲 Roll Dice";
  };

  const canRoll = !isRolling && consecutiveSixes < 3 && (
    currentDiceRolls.length === 0 ||
    (currentDiceRolls.length > 0 &&
     currentDiceRolls[currentDiceRolls.length - 1].value === 6 &&
     currentDiceRolls.length < 3)
  );

  return (
    <div className="dice-container">
      <div className="dice-section">
        <h3>🎲 Dice Roll</h3>

        {/* Dice Roll Button */}
        <button
          onClick={rollDice}
          disabled={!canRoll}
          className={`roll-button ${!canRoll ? 'disabled' : ''} ${isRolling ? 'rolling' : ''}`}
        >
          {getButtonText()}
        </button>

        {/* Roll Status */}
        <p className="roll-status">{getRollStatusMessage()}</p>
      </div>

      {/* Current Dice Display */}
      {currentDiceRolls.length > 0 && (
        <div className="current-dice-display">
          <h4>🎯 Dice Results This Turn:</h4>
          <div className="dice-results-grid">
            {currentDiceRolls.map((roll, index) => (
              <div key={index} className="dice-result-item">
                <DiceFace value={roll.value} />
                <span className="roll-number">Roll {index + 1}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="dice-summary">
            <p><strong>Values:</strong> {currentDiceRolls.map(r => r.value).join(', ')}</p>
            {consecutiveSixes > 0 && (
              <p className="sixes-count">
                🎲 Sixes rolled: <span className="six-highlight">{consecutiveSixes}</span>
                {consecutiveSixes < 3 && <span className="must-roll-again"> - Must roll again!</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dice;
