window.GameUI = {
  updateHud() {
    const state = GameState;
    document.getElementById("goldDisplay").textContent = state.gold;
    document.getElementById("scoreDisplay").textContent = String(state.score).padStart(3, "0");
    document.getElementById("bestDisplay").textContent = String(state.best).padStart(3, "0");
    this.renderShop();
  },

  renderShop() {
    const list = document.getElementById("skinList");
    list.innerHTML = "";

    GameState.skins.forEach((skin) => {
      const isOwned = GameState.owned.includes(skin.id);
      const active = GameState.selected === skin.id;
      const card = document.createElement("article");
      card.className = `skin-card ${active ? "active" : ""}`;
      card.innerHTML = `<div class="skin-preview" style="--skin: ${skin.color}"><i></i></div><div class="skin-info"><b>${skin.name}</b><small>${skin.detail}</small></div><button class="${isOwned ? "" : "buy"}" ${active ? "disabled" : ""}>${active ? "DIPAKAI" : isOwned ? "PAKAI" : `✦ ${skin.cost}`}</button>`;
      card.querySelector("button").onclick = () => Game.buyOrUseSkin(skin, isOwned, card);
      list.appendChild(card);
    });
  },

  updateEventBanner() {
    const state = GameState;
    const banner = document.getElementById("eventBanner");
    if (!state.activeEvent) {
      banner.className = "event-banner";
      banner.textContent = "";
      return;
    }

    const secondsLeft = Math.max(0, Math.ceil((state.eventEndAt - Date.now()) / 1000));
    const isFrenzy = state.activeEvent === "frenzy";
    banner.className = `event-banner visible${isFrenzy ? "" : " mine"}`;
    banner.textContent = isFrenzy
      ? `FEEDING FRENZY — 1 makanan = 3 gold · ${secondsLeft}d`
      : `MINE LAND — Bom muncul di depanmu! · ${secondsLeft}d`;
  },

  showGameOver() {
    const state = GameState;
    const overlay = document.getElementById("gameOverlay");
    const reviveButton = document.getElementById("startBtn");
    overlay.querySelector(".eyebrow").textContent = "PERMAINAN BERAKHIR";
    overlay.querySelector("h1").innerHTML = `Skor kamu:<br><em>${String(state.score).padStart(3, "0")}</em>`;
    overlay.querySelector(".overlay-copy").innerHTML = `Kamu mengumpulkan <b>${state.score} gold</b>. Revive berikutnya: <b>${state.reviveCost} gold</b>.`;
    reviveButton.innerHTML = `Revive - ${state.reviveCost} gold <span>+</span>`;
    reviveButton.disabled = state.gold < state.reviveCost;
    reviveButton.onclick = Game.revive;
    document.getElementById("restartBtn").classList.remove("hidden");
    overlay.classList.remove("hidden");
  },

  showPause() {
    const overlay = document.getElementById("gameOverlay");
    const button = document.getElementById("startBtn");
    overlay.querySelector(".eyebrow").textContent = "DIJEDA";
    overlay.querySelector("h1").innerHTML = "Tarik napas.<br><em>Lanjut?</em>";
    overlay.querySelector(".overlay-copy").textContent = "Tekan tombol untuk kembali berburu energi.";
    button.textContent = "Lanjutkan";
    button.disabled = false;
    button.onclick = Game.resume;
    document.getElementById("restartBtn").classList.add("hidden");
    overlay.classList.remove("hidden");
  },

  hideOverlay() {
    document.getElementById("gameOverlay").classList.add("hidden");
    document.getElementById("restartBtn").classList.add("hidden");
    document.getElementById("startBtn").disabled = false;
  },
};
