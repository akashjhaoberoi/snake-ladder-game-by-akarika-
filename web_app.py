"""Flask web server for Snake & Ladder game."""

from flask import Flask, render_template, jsonify, request
from random import randint
import json

app = Flask(__name__)

# Game state
game_state = {
    'players': [
        {'id': 1, 'name': 'Player 1', 'position': 0, 'color': '#FF6B6B'},
        {'id': 2, 'name': 'Player 2', 'position': 0, 'color': '#4ECDC4'}
    ],
    'current_player': 0,
    'dice_value': 0,
    'game_over': False,
    'winner': None
}

# Snakes and Ladders positions
SNAKES = {99: 54, 87: 36, 62: 19, 48: 9, 37: 10, 33: 6, 28: 1, 21: 5, 17: 7, 4: 2}
LADDERS = {2: 38, 7: 15, 21: 43, 28: 85, 50: 67, 54: 88, 60: 72, 76: 99, 78: 99, 91: 100}

def check_win(position):
    """Check if player has reached position 100."""
    return position >= 100

def apply_snake_or_ladder(position):
    """Apply snake or ladder effect if landing on special square."""
    if position in SNAKES:
        return SNAKES[position]
    elif position in LADDERS:
        return LADDERS[position]
    return position

def reset_game():
    """Reset game to initial state."""
    global game_state
    game_state = {
        'players': [
            {'id': 1, 'name': 'Player 1', 'position': 0, 'color': '#FF6B6B'},
            {'id': 2, 'name': 'Player 2', 'position': 0, 'color': '#4ECDC4'}
        ],
        'current_player': 0,
        'dice_value': 0,
        'game_over': False,
        'winner': None
    }

@app.route('/')
def index():
    """Serve the main game page."""
    return render_template('index.html')

@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    """Get current game state."""
    return jsonify(game_state)

@app.route('/api/game/roll', methods=['POST'])
def roll_dice():
    """Roll the dice and move the current player."""
    if game_state['game_over']:
        return jsonify({'error': 'Game is over'}), 400
    
    # Roll dice (1-6)
    dice_value = randint(1, 6)
    game_state['dice_value'] = dice_value
    
    # Move current player
    current_player = game_state['players'][game_state['current_player']]
    new_position = current_player['position'] + dice_value
    
    # Cap at 100 or apply snake/ladder
    if new_position > 100:
        new_position = current_player['position']  # Invalid move, stay in place
    else:
        new_position = apply_snake_or_ladder(new_position)
    
    current_player['position'] = new_position
    
    # Check for win
    if check_win(new_position):
        game_state['game_over'] = True
        game_state['winner'] = current_player['name']
    
    # Switch player only if didn't roll a 6
    if dice_value != 6:
        game_state['current_player'] = (game_state['current_player'] + 1) % len(game_state['players'])
    
    return jsonify(game_state)

@app.route('/api/game/reset', methods=['POST'])
def reset():
    """Reset the game."""
    reset_game()
    return jsonify(game_state)

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get game configuration."""
    return jsonify({
        'snakes': SNAKES,
        'ladders': LADDERS,
        'board_size': 100
    })

if __name__ == '__main__':
    print("Starting Snake & Ladder Web Server...")
    print("Open your browser and go to: http://localhost:5000")
    app.run(debug=False, host='localhost', port=5000, use_reloader=False)
