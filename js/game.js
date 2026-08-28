const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const LOGICAL_SIZE = 600;

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = LOGICAL_SIZE * dpr;
  canvas.height = LOGICAL_SIZE * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvas();

function drawGrid() {
  const state = GameState;
  ctx.strokeStyle = "rgba(192, 230, 220, 0.055)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= state.cells; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * state.size, 0);
    ctx.lineTo(index * state.size, 600);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, index * state.size);
    ctx.lineTo(600, index * state.size);
    ctx.stroke();
  }
}

function drawFood() {
  const { food, size } = GameState;
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#ffba35";
  ctx.fillStyle = "#ffc83d";
  ctx.beginPath();
  ctx.arc(food.x * size + 10, food.y * size + 10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 230, 120, 0.45)";
  ctx.beginPath();
  ctx.arc(food.x * size + 8, food.y * size + 8, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBombs() {
  const { bombs, size } = GameState;
  bombs.forEach((bomb) => {
    const x = bomb.x * size + 10;
    const y = bomb.y * size + 10;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff604b";
    ctx.fillStyle = "#303c3d";
    ctx.beginPath();
    ctx.arc(x, y + 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff604b";
    ctx.beginPath();
    ctx.arc(x, y + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb65b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 4);
    ctx.lineTo(x + 7, y - 8);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

function drawSnake() {
  const state = GameState;
  const color = state.skins.find((skin) => skin.id === state.selected).color;
  ctx.shadowBlur = 13;
  ctx.shadowColor = color;
  state.snake.slice().reverse().forEach((part, index) => {
    const radius = index === state.snake.length - 1 ? 7 : 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(part.x * state.size + 2, part.y * state.size + 2, 16, 16, radius);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  const head = state.snake[0];
  const eyeX = head.x * state.size + 10 + state.direction.x * 4;
  const eyeY = head.y * state.size + 10 + state.direction.y * 4;
  ctx.fillStyle = "#10201d";
  ctx.beginPath();
  ctx.arc(eyeX - state.direction.y * 4, eyeY + state.direction.x * 4, 1.8, 0, 7);
  ctx.arc(eyeX + state.direction.y * 4, eyeY - state.direction.x * 4, 1.8, 0, 7);
  ctx.fill();
}

window.Game = {
  lastTime: 0,
  accumulator: 0,

  getSpeed() {
    return Math.max(50, 115 - Math.floor(GameState.score * 1.2));
  },

  loop(timestamp) {
    if (!GameState.running) return;

    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;

    const speed = this.getSpeed();
    while (this.accumulator >= speed) {
      this.tick();
      this.accumulator -= speed;
      if (!GameState.running) return;
    }

    GameState.timer = requestAnimationFrame((ts) => this.loop(ts));
  },

  reset() {
    const state = GameState;
    state.snake = [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.score = 0;
    state.reviveCost = 5;
    state.paused = false;
    state.activeEvent = null;
    state.bombs = [];
    state.lastMineSpawnAt = 0;
    state.nextEventAt = Date.now() + GameEvents.randomDelay();
    this.spawnFood();
    GameUI.updateEventBanner();
  },

  spawnFood() {
    const state = GameState;
    do {
      state.food = { x: Math.floor(Math.random() * state.cells), y: Math.floor(Math.random() * state.cells) };
    } while (
      state.snake.some((part) => part.x === state.food.x && part.y === state.food.y) ||
      state.bombs.some((bomb) => bomb.x === state.food.x && bomb.y === state.food.y)
    );
  },

  draw() {
    ctx.fillStyle = "#0b1516";
    ctx.fillRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    drawBombs();
    drawSnake();
  },

  buyOrUseSkin(skin, isOwned, card) {
    const state = GameState;
    if (!isOwned) {
      if (state.gold < skin.cost) {
        card.querySelector("button").textContent = "GOLD KURANG";
        setTimeout(() => GameUI.renderShop(), 900);
        return;
      }
      state.gold -= skin.cost;
      state.owned.push(skin.id);
      GameAudio.buy();
    } else {
      GameAudio.equip();
    }
    state.selected = skin.id;
    GameStorage.save();
    GameUI.updateHud();
    this.draw();
  },

  hasCollision(head) {
    const state = GameState;
    const hitWall = head.x < 0 || head.y < 0 || head.x >= state.cells || head.y >= state.cells;
    const hitSelf = state.snake.some((part) => part.x === head.x && part.y === head.y);
    const hitBomb = state.bombs.some((bomb) => bomb.x === head.x && bomb.y === head.y);
    return hitWall || hitSelf || hitBomb;
  },

  eatFood() {
    const state = GameState;
    state.score += 1;
    const isFrenzy = state.activeEvent === "frenzy";
    state.gold += isFrenzy ? 3 : 1;
    state.best = Math.max(state.score, state.best);
    if (isFrenzy) {
      GameAudio.frenzyEat();
    } else {
      GameAudio.eat();
    }
    this.spawnFood();
    GameStorage.save();
    GameUI.updateHud();
  },

  tick() {
    const state = GameState;
    GameEvents.update();
    state.direction = state.nextDirection;
    const head = { x: state.snake[0].x + state.direction.x, y: state.snake[0].y + state.direction.y };
    if (this.hasCollision(head)) {
      this.gameOver();
      return;
    }
    state.snake.unshift(head);
    if (head.x === state.food.x && head.y === state.food.y) this.eatFood();
    else state.snake.pop();
    this.draw();
  },

  start() {
    if (GameState.timer) cancelAnimationFrame(GameState.timer);
    this.reset();
    this.lastTime = 0;
    this.accumulator = 0;
    GameState.running = true;
    GameUI.hideOverlay();
    GameUI.updateHud();
    this.draw();
    GameState.timer = requestAnimationFrame((ts) => this.loop(ts));
  },

  gameOver() {
    GameState.running = false;
    GameState.paused = false;
    if (GameState.timer) cancelAnimationFrame(GameState.timer);
    GameState.timer = null;
    GameAudio.gameOver();
    GameUI.showGameOver();
  },

  revive() {
    const state = GameState;
    if (state.gold < state.reviveCost) return;
    state.gold -= state.reviveCost;
    state.reviveCost *= 2;
    state.snake = [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    GameAudio.revive();
    Game.spawnFood();
    GameStorage.save();
    GameUI.updateHud();
    Game.resume();
  },

  setDirection(name) {
    const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const next = directions[name];
    const current = GameState.direction;
    if (next && !(next.x === -current.x && next.y === -current.y)) GameState.nextDirection = next;
  },

  resume() {
    const now = Date.now();
    if (GameState.activeEvent && GameState._pausedEventRemaining > 0) {
      GameState.eventEndAt = now + GameState._pausedEventRemaining;
    }
    if (!GameState.activeEvent && GameState._pausedNextEventRemaining > 0) {
      GameState.nextEventAt = now + GameState._pausedNextEventRemaining;
    }
    this.lastTime = 0;
    GameState.running = true;
    GameState.paused = false;
    GameUI.hideOverlay();
    GameState.timer = requestAnimationFrame((ts) => this.loop(ts));
  },

  pause() {
    if (!GameState.running) return;
    const now = Date.now();
    GameState.running = false;
    GameState.paused = true;
    GameState._pausedEventRemaining = GameState.activeEvent ? Math.max(0, GameState.eventEndAt - now) : 0;
    GameState._pausedNextEventRemaining = !GameState.activeEvent ? Math.max(0, GameState.nextEventAt - now) : 0;
    if (GameState.timer) cancelAnimationFrame(GameState.timer);
    GameState.timer = null;
    GameUI.showPause();
  },

  togglePause() {
    if (GameState.running) this.pause();
    else if (GameState.paused) this.resume();
  },
};

function handleKeydown(event) {
  const keys = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
  if (event.key === "p" || event.key === "P") {
    event.preventDefault();
    Game.togglePause();
  } else if (keys[event.key]) {
    event.preventDefault();
    Game.setDirection(keys[event.key]);
  }
}

document.getElementById("startBtn").onclick = () => Game.start();
document.getElementById("restartBtn").onclick = () => Game.start();
document.getElementById("pauseBtn").onclick = () => Game.togglePause();
document.addEventListener("keydown", handleKeydown);
document.querySelectorAll("[data-dir]").forEach((button) => {
  button.onclick = () => Game.setDirection(button.dataset.dir);
});

Game.reset();
GameUI.updateHud();
Game.draw();
