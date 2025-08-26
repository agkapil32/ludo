import React from 'react';
import { GameProvider, useGame } from '../context/GameContext';
import GameControls from '../components/GameControls/GameControls';
import Board from '../components/Board/Board';
import PlayerList from '../components/PlayerList/PlayerList';
import './GamePage.css';

interface GamePageProps {
  gameId: string;
  onBackToCreate: () => void;
}

const GamePageContent: React.FC<{ gameId: string; onBackToCreate: () => void }> = ({ gameId, onBackToCreate }) => {
  const { gameState, startGame } = useGame();

  return (
    <div className="game-page">
      <div className="game-header">
        <div className="game-info">
          <h2>🎲 Game: {gameId}</h2>
          <button onClick={onBackToCreate} className="back-button">
            ← Back to Menu
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="game-sidebar">
          <PlayerList />

          {/* Show Start Game button if game hasn't started and there are enough players */}
          {gameState && !gameState.started && gameState.players.length >= 2 && (
            <div className="start-game-section">
              <button onClick={startGame} className="start-game-button">
                Start Game ({gameState.players.length} players)
              </button>
              <p className="start-game-note">
                Need at least 2 players to start. Maximum 4 players.
              </p>
            </div>
          )}

          {gameState?.started && <GameControls />}
        </div>

        <div className="game-board-area">
          <Board />
        </div>
      </div>
    </div>
  );
};

const GamePage: React.FC<GamePageProps> = ({ gameId, onBackToCreate }) => {
  return (
    <GameProvider gameId={gameId}>
      <GamePageContent gameId={gameId} onBackToCreate={onBackToCreate} />
    </GameProvider>
  );
};

export default GamePage;
