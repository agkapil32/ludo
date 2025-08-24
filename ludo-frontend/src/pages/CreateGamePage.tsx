import React, { useState } from 'react';
import { ludoApi } from '../api/ludoApi';
import './CreateGamePage.css';

interface CreateGamePageProps {
  onGameCreated: (gameId: string) => void;
}

const CreateGamePage: React.FC<CreateGamePageProps> = ({ onGameCreated }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Step 1: Create a new game
      const gameData = await ludoApi.createGame();

      // Step 2: Add the player to the newly created game
      await ludoApi.addPlayer(gameData.gameId, playerName.trim());

      // Step 3: Store player name in localStorage for context
      localStorage.setItem('currentPlayerName', playerName.trim());

      onGameCreated(gameData.gameId);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Create game error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinPlayerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Add player to existing game
      await ludoApi.addPlayer(gameId.trim(), joinPlayerName.trim());

      // Store player name in localStorage for context
      localStorage.setItem('currentPlayerName', joinPlayerName.trim());

      onGameCreated(gameId.trim());
    } catch (err) {
      setError('Failed to join game. Please check the game ID and try again.');
      console.error('Join game error:', err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="create-game-page">
      <div className="create-game-container">
        <h2>🎲 Welcome to Ludo!</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="game-actions">
          <div className="create-section">
            <h4>Create New Game</h4>
            <div className="input-group">
              <label htmlFor="createPlayerName">Your Name:</label>
              <input
                id="createPlayerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleCreateGame}
              disabled={isCreating || !playerName.trim()}
              className="create-button"
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </button>
          </div>

          <div className="divider">OR</div>

          <div className="join-section">
            <h4>Join Existing Game</h4>
            <div className="input-group">
              <label htmlFor="joinPlayerName">Your Name:</label>
              <input
                id="joinPlayerName"
                type="text"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            <div className="input-group">
              <label htmlFor="gameId">Game ID:</label>
              <input
                id="gameId"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter Game ID"
                maxLength={36}
              />
            </div>
            <button
              onClick={handleJoinGame}
              disabled={isJoining || !joinPlayerName.trim() || !gameId.trim()}
              className="join-button"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGamePage;
