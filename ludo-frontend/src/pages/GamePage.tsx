import React, { useEffect, useState } from 'react';
import { GameProvider } from '../context/GameContext';
import GameControls from '../components/GameControls/GameControls';
import Board from '../components/Board/Board';
import PlayerList from '../components/PlayerList/PlayerList';
import { ludoApi } from '../api/ludoApi';
import { GameStateDTO } from '../types/gameTypes';
import './GamePage.css';

interface GamePageProps {
  gameId: string;
  onBackToCreate: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ gameId, onBackToCreate }) => {
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        setLoading(true);
        const state = await ludoApi.getGameState(gameId);
        setGameState(state);
      } catch (err) {
        setError('Failed to load game. Please try again.');
        console.error('Failed to fetch game state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameState();

    // Poll for game state updates every 10 seconds
    const interval = setInterval(fetchGameState, 10000);

    return () => clearInterval(interval);
  }, [gameId]);

  const handleStartGame = async () => {
    try {
      const updatedState = await ludoApi.startGame(gameId);
      setGameState(updatedState);
    } catch (err) {
      setError('Failed to start game. Please try again.');
      console.error('Failed to start game:', err);
    }
  };

  if (loading) {
    return (
      <div className="game-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-page">
        <div className="error-container">
          <h3>😞 Oops!</h3>
          <p>{error}</p>
          <button onClick={onBackToCreate} className="back-button">
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-page">
        <div className="error-container">
          <h3>😞 Game not found!</h3>
          <p>The game you're looking for doesn't exist.</p>
          <button onClick={onBackToCreate} className="back-button">
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameProvider gameId={gameId}>
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
            {!gameState.started && gameState.players.length >= 2 && (
              <div className="start-game-section">
                <button onClick={handleStartGame} className="start-game-button">
                  Start Game ({gameState.players.length} players)
                </button>
                <p className="start-game-note">
                  Need at least 2 players to start. Maximum 4 players.
                </p>
              </div>
            )}

            {gameState.started && <GameControls />}
          </div>

          <div className="game-board-area">
            <Board />
          </div>
        </div>
      </div>
    </GameProvider>
  );
};

export default GamePage;
