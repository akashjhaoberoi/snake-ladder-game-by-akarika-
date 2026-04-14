import pygame
import random

# Initialize
pygame.init()

# Screen setup
w, h = 800, 800   # square screen fits board nicely
screen = pygame.display.set_mode((w, h))
pygame.display.set_caption("Snake and Ladder")

# Font
font = pygame.font.SysFont(None, 36)

# --- Load Images ---
board_img = pygame.image.load("Board.png")
board_img = pygame.transform.scale(board_img, (w, h))

red_token = pygame.image.load("redgoti.png")
red_token = pygame.transform.scale(red_token, (40, 40))

blue_token = pygame.image.load("bluegoti.png")
blue_token = pygame.transform.scale(blue_token, (40, 40))

# (Optional dice faces)
dice_imgs = [pygame.image.load(f"dice{i}.png") for i in range(1, 7)]
dice_imgs = [pygame.transform.scale(img, (80, 80)) for img in dice_imgs]

# --- Game Settings ---
player1_pos = 1
player2_pos = 1
turn = 1
max_pos = 100
dice_value = 0

# Snakes & Ladders
snakes = {16: 6, 48: 30, 64: 60, 79: 19, 93: 68, 95: 24, 97: 76}
ladders = {1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100}

# --- Helper Functions ---
def roll_dice():
    return random.randint(1, 6)

def move_player(pos, dice):
    pos += dice
    if pos > max_pos:
        pos = max_pos
    if pos in snakes:
        pos = snakes[pos]
    if pos in ladders:
        pos = ladders[pos]
    return pos

def get_coordinates(square):
    """Map board square (1–100) to x,y coordinates"""
    row = (square - 1) // 10
    col = (square - 1) % 10
    if row % 2 == 1:  # reverse direction every other row
        col = 9 - col
    x = col * (w // 10) + (w // 20)  # center of square
    y = h - (row * (h // 10)) - (h // 20)
    return x, y

# --- Main Loop ---
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:  # Roll dice
                dice_value = roll_dice()
                if turn == 1:
                    player1_pos = move_player(player1_pos, dice_value)
                    turn = 2
                else:
                    player2_pos = move_player(player2_pos, dice_value)
                    turn = 1

    # --- Draw ---
    screen.blit(board_img, (0, 0))  # draw board

    # Dice (image if available, else text)
    if dice_value > 0:
        if len(dice_imgs) == 6:
            screen.blit(dice_imgs[dice_value - 1], (w - 100, 20))
        else:
            dice_text = font.render(f"Dice: {dice_value}", True, (0, 0, 0))
            screen.blit(dice_text, (w - 150, 30))

    # Draw player tokens
    x1, y1 = get_coordinates(player1_pos)
    x2, y2 = get_coordinates(player2_pos)
    screen.blit(red_token, (x1 - 20, y1 - 20))
    screen.blit(blue_token, (x2 - 20, y2 - 20))

    # Check winner
    if player1_pos == 100:
        win_text = font.render("Player 1 Wins!", True, (255, 0, 0))
        screen.blit(win_text, (w // 2 - 100, h // 2))
    elif player2_pos == 100:
        win_text = font.render("Player 2 Wins!", True, (0, 0, 255))
        screen.blit(win_text, (w // 2 - 100, h // 2))

    pygame.display.update()

pygame.quit()
