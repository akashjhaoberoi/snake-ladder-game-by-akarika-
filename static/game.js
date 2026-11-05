let gameState = {};
let config = {};
let isGameOver = false;

// Initialize the game
async function initGame() {
    try {
        // Fetch configuration
        const configResponse = await fetch('/api/config');
        config = await configResponse.json();
        
        // Fetch initial game state
        await updateGameState();
        
        // Create the board
        createBoard();
        
        // Attach event listeners
        document.getElementById('roll-btn').addEventListener('click', rollDice);
        document.getElementById('reset-btn').addEventListener('click', resetGame);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Update game state from server
async function updateGameState() {
    try {
        const response = await fetch('/api/game/state');
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
    
    // Reverse every other row to create the snake pattern
    const squares = Array.from(document.querySelectorAll('.square'));
    for (let row = 0; row < 10; row++) {
        if (row % 2 === 1) {
            // Reverse this row
            const rowStart = row * 10;
            const rowSquares = squares.slice(rowStart, rowStart + 10).reverse();
            rowSquares.forEach((square, index) => {
                square.style.order = rowStart + (9 - index);
            });
        }
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
    const gameStatusDiv = document.getElementById('game-status');
    const rollBtn = document.getElementById('roll-btn');
    
    // Update current player
    if (!gameState.game_over) {
        currentPlayerDiv.textContent = `${currentPlayer.name}'s Turn`;
        currentPlayerDiv.style.color = currentPlayer.color;
    }
    
    // Update dice result
    if (gameState.dice_value) {
        diceResultDiv.textContent = `🎲 ${gameState.dice_value}`;
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
