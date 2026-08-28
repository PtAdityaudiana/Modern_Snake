window.GameEvents = {
  randomDelay() {
    return (10 + Math.floor(Math.random() * 11)) * 1000;
  },

  update() {
    const state = GameState;
    const now = Date.now();
    if (state.activeEvent && now >= state.eventEndAt) {
      state.activeEvent = null;
      state.bombs = [];
      state.nextEventAt = now + this.randomDelay();
      GameUI.updateEventBanner();
    }

    if (!state.activeEvent && now >= state.nextEventAt) {
      this.startRandom(now);
    }

    if (state.activeEvent === "mine") {
      this.spawnDynamicMine(now);
    }
    if (state.activeEvent) {
      GameUI.updateEventBanner();
    }
  },

  startRandom(now) {
    const state = GameState;
    state.activeEvent = Math.random() < 0.5 ? "frenzy" : "mine";
    state.eventEndAt = now + (state.activeEvent === "frenzy" ? 15000 : 10000);
    if (state.activeEvent === "mine") {
      state.bombs = [];
      state.lastMineSpawnAt = 0;
      this.spawnDynamicMine(now);
    }
    GameUI.updateEventBanner();
  },

  spawnDynamicMine(now) {
    const state = GameState;
    if (now - state.lastMineSpawnAt < 700) {
      return;
    }

    const head = state.snake[0];
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const distanceAhead = 4 + Math.floor(Math.random() * 5);
      const sidewaysOffset = Math.floor(Math.random() * 7) - 3;
      const candidate = {
        x: head.x + state.direction.x * distanceAhead + state.direction.y * sidewaysOffset,
        y: head.y + state.direction.y * distanceAhead - state.direction.x * sidewaysOffset,
      };
      const outside = candidate.x < 0 || candidate.y < 0 || candidate.x >= state.cells || candidate.y >= state.cells;
      const occupied = state.snake.some((part) => part.x === candidate.x && part.y === candidate.y);
      const duplicate = state.bombs.some((bomb) => bomb.x === candidate.x && bomb.y === candidate.y);
      const onFood = candidate.x === state.food.x && candidate.y === state.food.y;
      if (!outside && !occupied && !duplicate && !onFood) {
        state.bombs.push(candidate);
        if (state.bombs.length > 12) state.bombs.shift();
        state.lastMineSpawnAt = now;
        return;
      }
    }
    state.lastMineSpawnAt = now;
  },
};
