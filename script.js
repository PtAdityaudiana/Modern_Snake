const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const size = 20;
const cells = 30;

const skins = [
  { id: "neon", name: "Neon Volt", detail: "Skin bawaan", color: "#caff35", cost: 0 },
  { id: "ocean", name: "Azure Wave", detail: "Edisi laut dalam", color: "#37c8ff", cost: 12 },
  { id: "sunset", name: "Solar Ember", detail: "Energi senja", color: "#ff8a3d", cost: 25 },
  { id: "royal", name: "Royal Bloom", detail: "Legenda arena", color: "#cf77ff", cost: 45 },
];

let gold = Number(localStorage.getItem("neonSnakeGold")) || 0;
let best = Number(localStorage.getItem("neonSnakeBest")) || 0;
let owned = JSON.parse(localStorage.getItem("neonSnakeOwned") || '["neon"]');
let selected = localStorage.getItem("neonSnakeSkin") || "neon";
let snake;
let food;
let dir;
let nextDir;
let score;
let running = false;
let timer;
let paused = false;
let reviveCost = 5;
let activeEvent = null;
let eventEndAt = 0;
let nextEventAt = 0;
let bombs = [];
let lastMineSpawnAt = 0;

function save() {
  localStorage.setItem("neonSnakeGold", gold);
  localStorage.setItem("neonSnakeBest", best);
  localStorage.setItem("neonSnakeOwned", JSON.stringify(owned));
  localStorage.setItem("neonSnakeSkin", selected);
}

function updateHud() {
  document.getElementById("goldDisplay").textContent = gold;
  document.getElementById("scoreDisplay").textContent = String(score || 0).padStart(3, "0");
  document.getElementById("bestDisplay").textContent = String(best).padStart(3, "0");
  renderShop();
}

function renderShop() {
  const list = document.getElementById("skinList");
  list.innerHTML = "";
  skins.forEach((skin) => {
    const isOwned = owned.includes(skin.id);
    const active = selected === skin.id;
    const card = document.createElement("article");
    card.className = `skin-card ${active ? "active" : ""}`;
    card.innerHTML = `<div class="skin-preview" style="--skin: ${skin.color}"><i></i></div><div class="skin-info"><b>${skin.name}</b><small>${skin.detail}</small></div><button class="${isOwned ? "" : "buy"}" ${active ? "disabled" : ""}>${active ? "DIPAKAI" : isOwned ? "PAKAI" : `✦ ${skin.cost}`}</button>`;
    card.querySelector("button").onclick = () => buyOrUseSkin(skin, isOwned, card);
    list.appendChild(card);
  });
}

function buyOrUseSkin(skin, isOwned, card) {
  if (!isOwned) {
    if (gold < skin.cost) {
      card.querySelector("button").textContent = "GOLD KURANG";
      setTimeout(renderShop, 900);
      return;
    }
    gold -= skin.cost;
    owned.push(skin.id);
  }
  selected = skin.id;
  save();
  updateHud();
  draw();
}

function reset() {
  snake = [
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 },
    { x: 12, y: 15 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  reviveCost = 5;
  paused = false;
  activeEvent = null;
  bombs = [];
  lastMineSpawnAt = 0;
  nextEventAt = Date.now() + randomEventDelay();
  spawnFood();
  updateEventBanner();
}

function randomEventDelay() {
  return (10 + Math.floor(Math.random() * 11)) * 1000;
}

function spawnFood() {
  do {
    food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function drawGrid() {
  ctx.strokeStyle = "rgba(192, 230, 220, 0.055)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= cells; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * size, 0);
    ctx.lineTo(index * size, 600);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, index * size);
    ctx.lineTo(600, index * size);
    ctx.stroke();
  }
}

function drawFood() {
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
  bombs.forEach((bomb) => {
    const centerX = bomb.x * size + 10;
    const centerY = bomb.y * size + 10;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff604b";
    ctx.fillStyle = "#303c3d";
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff604b";
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb65b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + 3, centerY - 4);
    ctx.lineTo(centerX + 7, centerY - 8);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

function drawSnake() {
  const color = skins.find((skin) => skin.id === selected).color;
  ctx.shadowBlur = 13;
  ctx.shadowColor = color;
  snake.slice().reverse().forEach((part, index) => {
    const radius = index === snake.length - 1 ? 7 : 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(part.x * size + 2, part.y * size + 2, 16, 16, radius);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  drawEyes();
}

function drawEyes() {
  const head = snake[0];
  const eyeX = head.x * size + 10 + dir.x * 4;
  const eyeY = head.y * size + 10 + dir.y * 4;
  ctx.fillStyle = "#10201d";
  ctx.beginPath();
  ctx.arc(eyeX - dir.y * 4, eyeY + dir.x * 4, 1.8, 0, 7);
  ctx.arc(eyeX + dir.y * 4, eyeY - dir.x * 4, 1.8, 0, 7);
  ctx.fill();
}

function draw() {
  ctx.fillStyle = "#0b1516";
  ctx.fillRect(0, 0, 600, 600);
  drawGrid();
  if (!snake) {
    return;
  }
  drawFood();
  drawBombs();
  drawSnake();
}

function hasCollision(head) {
  const hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  const hitBomb = bombs.some((bomb) => bomb.x === head.x && bomb.y === head.y);
  return hitWall || hitSelf || hitBomb;
}

function eatFood() {
  score += 1;
  gold += activeEvent === "frenzy" ? 3 : 1;
  best = Math.max(score, best);
  spawnFood();
  save();
  updateHud();
}

function tick() {
  updateEvent();
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (hasCollision(head)) {
    gameOver();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    eatFood();
  } else {
    snake.pop();
  }
  draw();
}

function updateEvent() {
  const now = Date.now();
  if (activeEvent && now >= eventEndAt) {
    activeEvent = null;
    bombs = [];
    nextEventAt = now + randomEventDelay();
    updateEventBanner();
  }

  if (!activeEvent && now >= nextEventAt) {
    startRandomEvent(now);
  }

  if (activeEvent) {
    if (activeEvent === "mine") {
      spawnDynamicMine(now);
    }
    updateEventBanner();
  }
}

function startRandomEvent(now) {
  activeEvent = Math.random() < 0.5 ? "frenzy" : "mine";
  eventEndAt = now + (activeEvent === "frenzy" ? 15000 : 10000);
  if (activeEvent === "mine") {
    bombs = [];
    lastMineSpawnAt = 0;
    spawnDynamicMine(now);
  }
  updateEventBanner();
}

function spawnDynamicMine(now) {
  if (now - lastMineSpawnAt < 700) {
    return;
  }

  const head = snake[0];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const distanceAhead = 4 + Math.floor(Math.random() * 5);
    const sidewaysOffset = Math.floor(Math.random() * 7) - 3;
    const candidate = {
      x: head.x + dir.x * distanceAhead + dir.y * sidewaysOffset,
      y: head.y + dir.y * distanceAhead - dir.x * sidewaysOffset,
    };

    const outsideBoard = candidate.x < 0 || candidate.y < 0 || candidate.x >= cells || candidate.y >= cells;
    const occupied = snake.some((part) => part.x === candidate.x && part.y === candidate.y);
    const duplicate = bombs.some((bomb) => bomb.x === candidate.x && bomb.y === candidate.y);
    const onFood = candidate.x === food.x && candidate.y === food.y;
    if (!outsideBoard && !occupied && !duplicate && !onFood) {
      bombs.push(candidate);
      if (bombs.length > 12) {
        bombs.shift();
      }
      lastMineSpawnAt = now;
      return;
    }
  }

  lastMineSpawnAt = now;
}

function updateEventBanner() {
  const banner = document.getElementById("eventBanner");
  if (!activeEvent) {
    banner.className = "event-banner";
    banner.textContent = "";
    return;
  }

  const secondsLeft = Math.max(0, Math.ceil((eventEndAt - Date.now()) / 1000));
  const isFrenzy = activeEvent === "frenzy";
  banner.className = `event-banner visible${isFrenzy ? "" : " mine"}`;
  banner.textContent = isFrenzy
    ? `FEEDING FRENZY — 1 makanan = 3 gold · ${secondsLeft}d`
    : `MINE LAND — Bom muncul di depanmu! · ${secondsLeft}d`;
}

function start() {
  clearInterval(timer);
  reset();
  running = true;
  document.getElementById("startBtn").disabled = false;
  document.getElementById("restartBtn").classList.add("hidden");
  document.getElementById("gameOverlay").classList.add("hidden");
  updateHud();
  draw();
  timer = setInterval(tick, 115);
}

function gameOver() {
  running = false;
  paused = false;
  clearInterval(timer);
  const overlay = document.getElementById("gameOverlay");
  const button = document.getElementById("startBtn");
  const restartButton = document.getElementById("restartBtn");
  overlay.querySelector(".eyebrow").textContent = "PERMAINAN BERAKHIR";
  overlay.querySelector("h1").innerHTML = `Skor kamu:<br><em>${String(score).padStart(3, "0")}</em>`;
  overlay.querySelector(".overlay-copy").innerHTML = `Kamu mengumpulkan <b>${score} gold</b>. Revive berikutnya: <b>${reviveCost} gold</b>.`;
  button.innerHTML = `Revive - ${reviveCost} gold <span>+</span>`;
  button.disabled = gold < reviveCost;
  button.onclick = revive;
  restartButton.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function revive() {
  if (gold < reviveCost) {
    gameOver();
    return;
  }

  gold -= reviveCost;
  reviveCost *= 2;
  snake = [
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 },
    { x: 12, y: 15 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  spawnFood();
  save();
  updateHud();
  resumeGame();
}

function setDirection(name) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const direction = directions[name];
  if (direction && !(direction.x === -dir.x && direction.y === -dir.y)) {
    nextDir = direction;
  }
}

function resumeGame() {
  running = true;
  paused = false;
  document.getElementById("gameOverlay").classList.add("hidden");
  timer = setInterval(tick, 115);
}

function pauseGame() {
  if (!running) {
    return;
  }
  running = false;
  paused = true;
  clearInterval(timer);
  const overlay = document.getElementById("gameOverlay");
  const button = document.getElementById("startBtn");
  const restartButton = document.getElementById("restartBtn");
  overlay.querySelector(".eyebrow").textContent = "DIJEDA";
  overlay.querySelector("h1").innerHTML = "Tarik napas.<br><em>Lanjut?</em>";
  overlay.querySelector(".overlay-copy").textContent = "Tekan tombol untuk kembali berburu energi.";
  button.textContent = "Lanjutkan";
  button.disabled = false;
  button.onclick = resumeGame;
  restartButton.classList.add("hidden");
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (running) {
    pauseGame();
  } else if (paused) {
    resumeGame();
  }
}

function handleKeydown(event) {
  const keys = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };
  if (event.key === "p" || event.key === "P") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (keys[event.key]) {
    event.preventDefault();
    setDirection(keys[event.key]);
  }
}

document.getElementById("startBtn").onclick = start;
document.getElementById("pauseBtn").onclick = togglePause;
document.getElementById("restartBtn").onclick = start;
document.addEventListener("keydown", handleKeydown);
document.querySelectorAll("[data-dir]").forEach((button) => {
  button.onclick = () => setDirection(button.dataset.dir);
});

reset();
updateHud();
draw();
