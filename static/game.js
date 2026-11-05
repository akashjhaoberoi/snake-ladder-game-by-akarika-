let gameState = {};
let config = {};
let localMode = false;
const localConfig = {
    snakes: {99:54,87:36,62:19,48:9,37:10,33:6,28:1,21:5,17:7,4:2},
    ladders: {2:38,7:15,21:43,28:85,50:67,54:88,60:72,76:99,78:99,91:100},
    board_size: 100
};
const initialState = () => ({
    players: [
        {id: 1, name: 'Player 1', position: 0, color: '#ef476f'},
        {id: 2, name: 'Player 2', position: 0, color: '#118ab2'}
    ],
    current_player: 0, dice_value: 0, game_over: false, winner: null
});

// Initialize the game
async function initGame() {
    try {
        // Fetch configuration
        const configResponse = await fetch('api/config');
        config = await configResponse.json();
        
        // Fetch initial game state
        await updateGameState();
        
        // Create the board
        createBoard();
        
        // Attach event listeners
        document.getElementById('roll-btn').addEventListener('click', rollDice);
        document.getElementById('reset-btn').addEventListener('click', resetGame);
    } catch (error) {
        localMode = true;
        config = localConfig;
        gameState = initialState();
        createBoard();
        updateUI();
    }
}

// Update game state from server
async function updateGameState() {
    try {
        if (localMode) return;
        const response = await fetch('api/game/state');
        gameState = await response.json();
        updateUI();
    } catch (error) {
        console.error('Error updating game state:', error);
    }
}

// Create the board grid
function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    // Create 100 squares
    for (let i = 1; i <= 100; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        square.id = `square-${i}`;
        
        // Check if it's a snake or ladder
        if (config.snakes[i]) {
            square.classList.add('snake');
        } else if (config.ladders[i]) {
            square.classList.add('ladder');
        }
        
        // Add square number
        const numberSpan = document.createElement('span');
        numberSpan.className = 'square-number';
        numberSpan.textContent = i;
        square.appendChild(numberSpan);
        
        // Add content div for player markers
        const contentDiv = document.createElement('div');
        contentDiv.className = 'square-content';
        square.appendChild(contentDiv);
        
        board.appendChild(square);
    }
    
    updatePlayerPositions();
}

// Update player positions on the board
function updatePlayerPositions() {
    // Clear all player markers
    document.querySelectorAll('.player-marker').forEach(marker => marker.remove());
    
    // Place player markers
    gameState.players.forEach(player => {
        const position = Math.max(0, player.position);
        if (position > 0) {
            const square = document.getElementById(`square-${position}`);
            if (square) {
                const marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.style.backgroundColor = player.color;
                marker.textContent = player.id;
                square.querySelector('.square-content').appendChild(marker);
            }
        }
    });
}

// Update UI elements
function updateUI() {
    const currentPlayer = gameState.players[gameState.current_player];
    const currentPlayerDiv = document.getElementById('current-player');
    const diceResultDiv = document.getElementById('dice-result');
    const diceImage = document.getElementById('dice-image');
    const gameStatusDiv = document.getElementById('game-status');
    const rollBtn = document.getElementById('roll-btn');
    
    // Update current player
    if (!gameState.game_over) {
        currentPlayerDiv.textContent = `${currentPlayer.name}'s Turn`;
        currentPlayerDiv.style.color = currentPlayer.color;
    }
    
    // Update dice result
    if (gameState.dice_value) {
        diceImage.src = `static/assets/dice${gameState.dice_value}.png`;
        diceImage.alt = `Dice showing ${gameState.dice_value}`;
    }
    
    // Update game status
    if (gameState.game_over) {
        gameStatusDiv.classList.add('winner');
        gameStatusDiv.textContent = `🎉 ${gameState.winner} Wins! 🎉`;
        rollBtn.disabled = true;
    } else {
        gameStatusDiv.classList.remove('winner');
        gameStatusDiv.textContent = `${currentPlayer.name} at Position ${currentPlayer.position}`;
        rollBtn.disabled = false;
    }
    
    updatePlayerPositions();
}

// Roll the dice
async function rollDice() {
    try {
        if (localMode) {
            const diceValue = Math.floor(Math.random() * 6) + 1;
            const player = gameState.players[gameState.current_player];
            const next = player.position + diceValue;
            gameState.dice_value = diceValue;
            if (next <= 100) player.position = config.snakes[next] || config.ladders[next] || next;
            if (player.position === 100) {
                gameState.game_over = true;
                gameState.winner = player.name;
            } else if (diceValue !== 6) {
                gameState.current_player = (gameState.current_player + 1) % gameState.players.length;
            }
            updateUI();
            return;
        }
        const response = await fetch('/api/game/roll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            await updateGameState();
        }
    } catch (error) {
        console.error('Error rolling dice:', error);
    }
}

// Reset the game
async function resetGame() {
    try {
        if (localMode) {
            gameState = initialState();
            updateUI();
            return;
        }
        const response = await fetch('/api/game/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            await updateGameState();
            document.getElementById('dice-result').textContent = '';
        }
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
