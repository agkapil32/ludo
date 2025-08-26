# 🎲 Ludo Backend API

A Spring Boot REST API backend for a multiplayer Ludo game with real-time gameplay features.

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Run the Application

```bash
# Clone and navigate to the project
cd /Users/k0k0a3h/Desktop/Personal/Ludo

# Run the application
./mvnw spring-boot:run

# Or using Maven directly
mvn spring-boot:run
```

The server will start on `http://localhost:8080`
## 📋 API Documentation

### Base URL
```
http://localhost:8080/ludo/backend/v1
```

## 🎮 Game Management APIs

<details>
<summary><strong>🎯 Create New Game</strong></summary>

### `GET /createGame`

Creates a new Ludo game instance.

**Request:**
```bash
curl -X GET "http://localhost:8080/ludo/backend/v1/createGame"
```

**Response:**
```json
{
  "gameId": "game-uuid-123",
  "started": false,
  "end": false,
  "currentPlayerId": null,
  "currentPlayerIndex": 0,
  "players": [],
  "currentDiceRolls": [],
  "winners": [],
  "playerPositions": {}
}
```

**Test it now:**
```bash
# Try this command in your terminal
curl -X GET "http://localhost:8080/ludo/backend/v1/createGame" | jq
```

</details>

<details>
<summary><strong>👤 Add Player to Game</strong></summary>

### `POST /addPlayer`

Adds a player to an existing game.

**Parameters:**
- `gameId` (required): Game identifier
- `playerName` (required): Player's name

**Request:**
```bash
curl -X POST "http://localhost:8080/ludo/backend/v1/addPlayer" \
  -d "gameId=your-game-id" \
  -d "playerName=Player1"
```

**Interactive Test:**
```bash
# First create a game and copy the gameId, then:
curl -X POST "http://localhost:8080/ludo/backend/v1/addPlayer" \
  -d "gameId=PASTE_GAME_ID_HERE" \
  -d "playerName=Alice" | jq
```

</details>

<details>
<summary><strong>🚀 Start Game</strong></summary>

### `POST /startGame`

Starts the game with all added players.

**Parameters:**
- `gameId` (required): Game identifier

**Request:**
```bash
curl -X POST "http://localhost:8080/ludo/backend/v1/startGame" \
  -d "gameId=your-game-id"
```

</details>

## 🎲 Gameplay APIs

<details>
<summary><strong>🎲 Roll Dice</strong></summary>

### `POST /rollDice/playerIndex`

Rolls the dice for a specific player.

**Parameters:**
- `gameId` (required): Game identifier
- `playerIndex` (required): Player index (0-3)

**Request:**
```bash
curl -X POST "http://localhost:8080/ludo/backend/v1/rollDice/playerIndex" \
  -d "gameId=your-game-id" \
  -d "playerIndex=0"
```

</details>

<details>
<summary><strong>🚶 Move Token</strong></summary>

### `POST /moveToken/playerIndex`

Moves a player's token on the board.

**Parameters:**
- `gameId` (required): Game identifier
- `playerIndex` (required): Player index (0-3)
- `tokenIndex` (required): Token index (0-3)

**Request:**
```bash
curl -X POST "http://localhost:8080/ludo/backend/v1/moveToken/playerIndex" \
  -d "gameId=your-game-id" \
  -d "playerIndex=0" \
  -d "tokenIndex=0"
```

</details>

<details>
<summary><strong>📊 Get Game State</strong></summary>

### `GET /getGameState`

Retrieves the current state of the game.

**Parameters:**
- `gameId` (required): Game identifier

**Request:**
```bash
curl -X GET "http://localhost:8080/ludo/backend/v1/getGameState?gameId=your-game-id"
```

</details>

## 🧪 Complete Game Flow Example

Here's a complete example of how to play a game using the API:

<details>
<summary><strong>📝 Step-by-Step Game Tutorial</strong></summary>

### Step 1: Create a New Game
```bash
# Create game
GAME_RESPONSE=$(curl -s -X GET "http://localhost:8080/ludo/backend/v1/createGame")
GAME_ID=$(echo $GAME_RESPONSE | jq -r '.gameId')
echo "Created game with ID: $GAME_ID"
```

### Step 2: Add Players
```bash
# Add Player 1
curl -X POST "http://localhost:8080/ludo/backend/v1/addPlayer" \
  -d "gameId=$GAME_ID" \
  -d "playerName=Alice"

# Add Player 2
curl -X POST "http://localhost:8080/ludo/backend/v1/addPlayer" \
  -d "gameId=$GAME_ID" \
  -d "playerName=Bob"
```

### Step 3: Start the Game
```bash
curl -X POST "http://localhost:8080/ludo/backend/v1/startGame" \
  -d "gameId=$GAME_ID"
```

### Step 4: Play the Game
```bash
# Player 0 rolls dice
curl -X POST "http://localhost:8080/ludo/backend/v1/rollDice/playerIndex" \
  -d "gameId=$GAME_ID" \
  -d "playerIndex=0"

# Player 0 moves token
curl -X POST "http://localhost:8080/ludo/backend/v1/moveToken/playerIndex" \
  -d "gameId=$GAME_ID" \
  -d "playerIndex=0" \
  -d "tokenIndex=0"

# Check game state
curl -X GET "http://localhost:8080/ludo/backend/v1/getGameState?gameId=$GAME_ID" | jq
```

</details>

## 📦 Project Structure

```
src/main/java/com/example/Ludo/
├── LudoApplication.java                 # Main Spring Boot application
└── metadata/
    ├── core/
    │   ├── controllers/
    │   │   ├── GameControllers.java     # Main game API endpoints
    │   │   └── SignalController.java    # Callback endpoints
    │   ├── dto/                         # Data Transfer Objects
    │   ├── service/                     # Business logic
    │   ├── model/                       # Entity models
    │   └── config/                      # Configuration classes
    └── exception/                       # Exception handling
```

## 🔧 Configuration

### Application Properties
```properties
spring.application.name=Ludo
server.port=8080
```

### CORS Configuration
The application includes CORS configuration to allow frontend applications running on different ports.

## 🛠️ Technology Stack

- **Framework:** Spring Boot 2.7.18
- **Java Version:** 17
- **Build Tool:** Maven
- **Key Dependencies:**
  - Spring Web (REST APIs)
  - Spring WebSocket (Real-time features)
  - Lombok (Code generation)

## 🚦 API Response Format

All APIs return a `GameStateDTO` object with the following structure:

```json
{
  "gameId": "string",
  "started": boolean,
  "end": boolean,
  "currentPlayerId": "string",
  "currentPlayerIndex": number,
  "players": [PlayerDTO],
  "currentDiceRolls": [DiceDTO],
  "winners": [PlayerDTO],
  "playerPositions": {}
}
```

## 🐛 Common Issues & Solutions

<details>
<summary><strong>CORS Errors</strong></summary>

If you're getting CORS errors when calling from a frontend:

1. Make sure your frontend origin is allowed in the CORS configuration
2. Check that you're using the correct HTTP method (GET vs POST)
3. Ensure the server is running on the expected port (8080)

</details>

<details>
<summary><strong>Game Not Found</strong></summary>

If you get "Game not found" errors:
- Verify the gameId is correct
- Make sure the game was created successfully
- Check server logs for any errors

</details>

## 🧪 Testing the APIs

### Using curl (recommended)
All examples above use curl commands that you can run directly in your terminal.

### Using Postman
Import the following collection:
1. Create a new Postman collection
2. Add requests for each endpoint listed above
3. Use environment variables for `gameId` to chain requests

### Using Frontend
The project includes a React frontend in the `ludo-frontend/` directory that demonstrates all API usage.

## 📈 Development

### Building
```bash
mvn clean compile
```

### Testing
```bash
mvn test
```

### Packaging
```bash
mvn clean package
```

## 🔗 Related Projects

- **Frontend:** `/ludo-frontend/` - React.js frontend application
- **API Client:** Check `ludo-frontend/src/api/ludoApi.ts` for TypeScript API client examples

---

## 🎮 Ready to Play?

1. **Start the server:** `./mvnw spring-boot:run`
2. **Create a game:** `curl -X GET "http://localhost:8080/ludo/backend/v1/createGame"`
3. **Add players and start playing!**

Happy gaming! 🎲🎯
