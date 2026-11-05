"""Simple HTTP web server for Snake & Ladder game using built-in libraries."""

import http.server
import socketserver
import json
import urllib.parse
from pathlib import Path
from random import randint

PORT = 5000
HOST = 'localhost'

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

class GameHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for the game."""
    
    def do_GET(self):
        """Handle GET requests."""
        if self.path == '/':
            self.serve_file('templates/index.html', 'text/html')
        elif self.path == '/api/game/state':
            self.send_json(game_state)
        elif self.path == '/api/config':
            self.send_json({
                'snakes': SNAKES,
                'ladders': LADDERS,
                'board_size': 100
            })
        elif self.path.startswith('/static/'):
            file_path = self.path[1:]  # Remove leading /
            if file_path.endswith('.css'):
                self.serve_file(file_path, 'text/css')
            elif file_path.endswith('.js'):
                self.serve_file(file_path, 'application/javascript')
            else:
                self.send_error(404)
        else:
            self.send_error(404)
    
    def do_POST(self):
        """Handle POST requests."""
        if self.path == '/api/game/roll':
            self.roll_dice()
        elif self.path == '/api/game/reset':
            reset_game()
            self.send_json(game_state)
        else:
            self.send_error(404)
    
    def roll_dice(self):
        """Roll the dice and move the current player."""
        global game_state
        
        if game_state['game_over']:
            self.send_error(400, 'Game is over')
            return
        
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
        
        self.send_json(game_state)
    
    def serve_file(self, file_path, content_type):
        """Serve a static file."""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404)
    
    def send_json(self, data):
        """Send JSON response."""
        json_response = json.dumps(data).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-Length', len(json_response))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json_response)
    
    def send_error(self, code, message=None):
        """Send error response."""
        error_msg = message or self.responses.get(code, ('Unknown',))[0]
        json_response = json.dumps({'error': error_msg}).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-Length', len(json_response))
        self.end_headers()
        self.wfile.write(json_response)
    
    def log_message(self, format, *args):
        """Override to add custom logging."""
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    handler = GameHandler
    
    with socketserver.TCPServer((HOST, PORT), handler) as httpd:
        print(f"Starting Snake & Ladder Web Server...")
        print(f"Open your browser and go to: http://{HOST}:{PORT}")
        print(f"Press Ctrl+C to stop the server\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
