import React, { useState } from 'react';
import CreateGamePage from './pages/CreateGamePage';
import GamePage from './pages/GamePage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'create' | 'game'>('create');
  const [gameId, setGameId] = useState<string>('');

  const handleGameCreated = (newGameId: string) => {
    setGameId(newGameId);
    setCurrentPage('game');
  };

  const handleBackToCreate = () => {
    setCurrentPage('create');
    setGameId('');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎲 Ludo Game</h1>
        <p>New Rules: Roll 6 = Must roll again (max 3 rolls). Three 6s = Turn skipped!</p>
      </header>

      <main className="app-main">
        {currentPage === 'create' ? (
          <CreateGamePage onGameCreated={handleGameCreated} />
        ) : (
          <GamePage
            gameId={gameId}
            onBackToCreate={handleBackToCreate}
          />
        )}
      </main>
    </div>
  );
}

export default App;
