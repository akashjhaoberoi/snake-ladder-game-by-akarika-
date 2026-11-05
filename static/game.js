const config = {
    snakes: {99: 54, 87: 36, 62: 19, 48: 9, 37: 10, 33: 6, 28: 1, 21: 5, 17: 7, 4: 2},
    ladders: {2: 38, 7: 15, 21: 43, 28: 85, 50: 67, 54: 88, 60: 72, 76: 99, 78: 99, 91: 100}
};
const colors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'];
let state;
let musicMuted = false;
let computerPlayer = false;
let introTimer;
let isMoving = false;

const $ = (id) => document.getElementById(id);
function show(id) {
    ['menu-screen', 'options-screen', 'credits-screen', 'game-screen'].forEach((screen) => $(screen).classList.toggle('hidden', screen !== id));
}
function playSound(id) {
    if (!musicMuted) {
        const sound = $(id);
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}
function setMusicMuted(muted) {
    musicMuted = muted;
    $('music').muted = muted;
    document.querySelectorAll('#mute-menu, #music-toggle').forEach((button) => { button.textContent = muted ? 'Play Music' : 'Mute Music'; });
}
function startMusic() {
    $('music').play().catch(() => {});
}
function newState(count, vsComputer) {
    const players = Array.from({length: count}, (_, index) => ({
        id: index + 1,
        name: vsComputer && index === 1 ? 'Computer' : `Player ${index + 1}`,
        position: 0,
        color: colors[index]
    }));
    return {players, current_player: 0, dice_value: 0, game_over: false, winner: null};
}
function createBoard() {
    const board = $('board');
    board.innerHTML = '';
    for (let number = 1; number <= 100; number += 1) {
        const square = document.createElement('div');
        square.className = 'square';
        square.id = `square-${number}`;
        if (config.snakes[number]) square.classList.add('snake');
        if (config.ladders[number]) square.classList.add('ladder');
        square.innerHTML = `<span class="square-number">${number}</span><div class="square-content"></div>`;
        const row = Math.floor((number - 1) / 10);
        const column = row % 2 === 0 ? (number - 1) % 10 : 9 - ((number - 1) % 10);
        square.style.gridRow = String(10 - row);
        square.style.gridColumn = String(column + 1);
        board.appendChild(square);
    }
}
function updatePositions() {
    document.querySelectorAll('.player-marker').forEach((marker) => marker.remove());
    state.players.forEach((player) => {
        if (player.position > 0) {
            const square = $(`square-${player.position}`);
            if (!square) return;
            const marker = document.createElement('div');
            marker.className = 'player-marker';
            marker.style.backgroundColor = player.color;
            marker.textContent = player.id;
            square.querySelector('.square-content').appendChild(marker);
        }
    });
}
function updateUI() {
    const player = state.players[state.current_player];
    $('current-player').textContent = state.game_over ? `${state.winner} wins!` : `${player.name}'s Turn`;
    $('current-player').style.color = player.color;
    if (state.dice_value) $('dice-image').src = `static/assets/dice${state.dice_value}.png`;
    $('game-status').textContent = state.game_over ? `🎉 ${state.winner} Wins! 🎉` : (state.last_move || `${player.name} at Position ${player.position}`);
    $('game-status').classList.toggle('winner', state.game_over);
    $('roll-btn').disabled = state.game_over || player.name === 'Computer';
    $('player-list').innerHTML = state.players.map((item, index) => `<div class="player-row ${index === state.current_player && !state.game_over ? 'active' : ''}"><span style="background:${item.color}"></span>${item.name}<strong>${item.position}</strong></div>`).join('');
    updatePositions();
}
function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
async function animateMove(player, start, end) {
    const direction = end >= start ? 1 : -1;
    for (let position = start + direction; direction > 0 ? position <= end : position >= end; position += direction) {
        player.position = position;
        updatePositions();
        await wait(90);
    }
}
async function takeTurn() {
    if (state.game_over || isMoving) return;
    isMoving = true;
    const player = state.players[state.current_player];
    const roll = Math.floor(Math.random() * 6) + 1;
    const start = player.position;
    const next = player.position + roll;
    state.dice_value = roll;
    state.last_move = `${player.name} rolled ${roll}: ${start} → ${next > 100 ? start : next}`;
    updateUI();
    await wait(300);
    if (next <= 100) {
        await animateMove(player, start, next);
        const landing = config.snakes[next] || config.ladders[next] || next;
        if (landing !== next) {
            playSound(config.ladders[next] ? 'ladder-sound' : 'snake-sound');
            await wait(250);
            await animateMove(player, next, landing);
            state.last_move = config.ladders[next] ? `${player.name} climbed from ${next} to ${landing}!` : `${player.name} slid from ${next} to ${landing}!`;
        }
    } else {
        state.last_move = `${player.name} rolled ${roll}: needs an exact roll and stays on ${start}.`;
    }
    if (player.position === 100) {
        state.game_over = true;
        state.winner = player.name;
        playSound(player.name === 'Computer' ? 'lose-sound' : 'win-sound');
    } else if (roll !== 6) {
        state.current_player = (state.current_player + 1) % state.players.length;
    }
    isMoving = false;
    updateUI();
    if (!state.game_over && state.players[state.current_player].name === 'Computer') setTimeout(takeTurn, 700);
}
function startGame(count, vsComputer) {
    computerPlayer = vsComputer;
    state = newState(count, vsComputer);
    createBoard();
    show('game-screen');
    updateUI();
    startMusic();
}
function finishIntro() {
    clearTimeout(introTimer);
    $('intro-screen').classList.add('hidden');
    $('app').classList.remove('hidden');
    show('menu-screen');
    startMusic();
}
document.addEventListener('DOMContentLoaded', () => {
    $('skip-intro').addEventListener('click', finishIntro);
    introTimer = setTimeout(finishIntro, 2500);
    $('play-menu').addEventListener('click', () => show('options-screen'));
    $('credits-menu').addEventListener('click', () => show('credits-screen'));
    $('credits-back').addEventListener('click', () => show('menu-screen'));
    $('options-back').addEventListener('click', () => show('menu-screen'));
    $('quit-menu').addEventListener('click', () => { $('menu-screen').innerHTML = '<h1>Thanks for playing!</h1><button class="btn btn-roll" onclick="location.reload()">Restart</button>'; });
    document.querySelectorAll('.player-choice').forEach((button) => button.addEventListener('click', () => startGame(Number(button.dataset.players), button.dataset.computer === 'true')));
    document.querySelectorAll('#mute-menu, #music-toggle').forEach((button) => button.addEventListener('click', () => setMusicMuted(!musicMuted)));
    $('roll-btn').addEventListener('click', takeTurn);
    $('reset-btn').addEventListener('click', () => { state = newState(state.players.length, computerPlayer); updateUI(); });
    $('game-back').addEventListener('click', () => show('menu-screen'));
});
