window.GameState = {
  size: 20,
  cells: 30,
  skins: [
    { id: "neon", name: "Neon Volt", detail: "Skin bawaan", color: "#caff35", cost: 0 },
    { id: "ocean", name: "Azure Wave", detail: "Edisi laut dalam", color: "#37c8ff", cost: 12 },
    { id: "sunset", name: "Solar Ember", detail: "Energi senja", color: "#ff8a3d", cost: 25 },
    { id: "royal", name: "Royal Bloom", detail: "Legenda arena", color: "#cf77ff", cost: 45 },
  ],
  gold: Number(localStorage.getItem("neonSnakeGold")) || 0,
  best: Number(localStorage.getItem("neonSnakeBest")) || 0,
  owned: JSON.parse(localStorage.getItem("neonSnakeOwned") || '["neon"]'),
  selected: localStorage.getItem("neonSnakeSkin") || "neon",
  snake: [],
  food: null,
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  score: 0,
  running: false,
  paused: false,
  timer: null,
  reviveCost: 5,
  activeEvent: null,
  eventEndAt: 0,
  nextEventAt: 0,
  bombs: [],
  lastMineSpawnAt: 0,
};

window.GameStorage = {
  save() {
    const state = GameState;
    localStorage.setItem("neonSnakeGold", state.gold);
    localStorage.setItem("neonSnakeBest", state.best);
    localStorage.setItem("neonSnakeOwned", JSON.stringify(state.owned));
    localStorage.setItem("neonSnakeSkin", state.selected);
  },
};
