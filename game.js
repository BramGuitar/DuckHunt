const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const timeEl = document.getElementById("time");
const missesEl = document.getElementById("misses");
const comboEl = document.getElementById("combo");
const messageEl = document.getElementById("message");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const crosshair = document.getElementById("crosshair");

const settings = {
  gameSeconds: 45,
  maxMisses: 8,
  spawnMs: 900,
  minSpawnMs: 420,
  duckLifeMs: 2500,
  bonusDuckChance: 0.17,
  bonusPoints: 25,
  bonusTime: 2,
};

const state = {
  score: 0,
  misses: 0,
  combo: 0,
  timeLeft: settings.gameSeconds,
  highScore: getSavedHighScore(),
  spawnDelay: settings.spawnMs,
  running: false,
  paused: false,
  timers: {
    spawner: null,
    clock: null,
  },
};

function getSavedHighScore() {
  try {
    const value = Number(localStorage.getItem("duck-hunt-high-score") || 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem("duck-hunt-high-score", String(score));
  } catch {
    // Ignore storage errors (private browsing, blocked storage).
  }
}

function resetState() {
  state.score = 0;
  state.misses = 0;
  state.combo = 0;
  state.timeLeft = settings.gameSeconds;
  state.spawnDelay = settings.spawnMs;
  state.running = false;
  state.paused = false;
  clearTimers();
  removeAllDucks();
  renderHUD();
}

function getMultiplier() {
  if (state.combo >= 8) return 3;
  if (state.combo >= 4) return 2;
  return 1;
}

function renderHUD() {
  scoreEl.textContent = String(state.score);
  highScoreEl.textContent = String(state.highScore);
  timeEl.textContent = String(state.timeLeft);
  missesEl.textContent = String(state.misses);
  comboEl.textContent = `x${getMultiplier()}`;
}

function clearTimers() {
  if (state.timers.spawner) {
    clearInterval(state.timers.spawner);
    state.timers.spawner = null;
  }
  if (state.timers.clock) {
    clearInterval(state.timers.clock);
    state.timers.clock = null;
  }
}

function refreshSpawner() {
  if (state.timers.spawner) {
    clearInterval(state.timers.spawner);
  }
  state.timers.spawner = setInterval(spawnDuck, state.spawnDelay);
}

function removeAllDucks() {
  for (const duck of gameArea.querySelectorAll(".duck")) {
    duck.remove();
  }
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function buzz(ms) {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function maybeIncreaseDifficulty() {
  const elapsed = settings.gameSeconds - state.timeLeft;
  const targetDelay = Math.max(settings.minSpawnMs, settings.spawnMs - elapsed * 10);
  if (targetDelay < state.spawnDelay) {
    state.spawnDelay = targetDelay;
    refreshSpawner();
  }
}

function spawnDuck() {
  if (!state.running || state.paused) return;

  const isBonus = Math.random() < settings.bonusDuckChance;
  const duck = document.createElement("button");
  duck.className = `duck${isBonus ? " bonus" : ""}`;
  duck.type = "button";
  duck.setAttribute("aria-label", isBonus ? "Bonus duck target" : "Duck target");
  duck.textContent = "🦆";

  const rect = gameArea.getBoundingClientRect();
  const size = isBonus ? Math.min(58, Math.max(36, rect.width * 0.09)) : Math.min(68, Math.max(46, rect.width * 0.115));
  const x = randomInRange(2, Math.max(3, rect.width - size - 2));
  const y = randomInRange(20, Math.max(24, rect.height * 0.62 - size));
  const driftX = randomInRange(-22, 22);

  duck.style.left = `${x}px`;
  duck.style.top = `${y}px`;

  duck.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${driftX}px, -14px)` },
      { transform: "translate(0, -24px)" },
    ],
    {
      duration: isBonus ? settings.duckLifeMs - 700 : settings.duckLifeMs,
      easing: "ease-out",
      fill: "forwards",
    }
  );

  let hit = false;
  duck.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!state.running || state.paused || hit) return;
    hit = true;

    state.combo += 1;
    const multiplier = getMultiplier();
    const basePoints = isBonus ? settings.bonusPoints : 10;
    state.score += basePoints * multiplier;

    if (isBonus) {
      state.timeLeft = Math.min(99, state.timeLeft + settings.bonusTime);
    }

    buzz(20);
    renderHUD();
    duck.classList.add("hit");
    setTimeout(() => duck.remove(), 120);
  });

  gameArea.appendChild(duck);

  const duckLifeMs = isBonus ? settings.duckLifeMs - 700 : settings.duckLifeMs;
  setTimeout(() => {
    if (duck.isConnected && !hit && state.running && !state.paused) {
      duck.remove();
      registerMiss();
    }
  }, duckLifeMs + 30);
}

function registerMiss() {
  state.misses += 1;
  state.combo = 0;
  buzz(40);
  renderHUD();
  if (state.misses >= settings.maxMisses) {
    endGame(false);
  }
}

function tickClock() {
  if (!state.running || state.paused) return;
  state.timeLeft -= 1;
  maybeIncreaseDifficulty();
  renderHUD();
  if (state.timeLeft <= 0) {
    endGame(true);
  }
}

function startGame() {
  resetState();
  state.running = true;

  messageEl.hidden = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  pauseBtn.textContent = "Pause";

  spawnDuck();
  refreshSpawner();
  state.timers.clock = setInterval(tickClock, 1000);
}

function pauseResume() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (state.paused) {
    removeAllDucks();
    return;
  }

  spawnDuck();
}

function endGame(timeUp) {
  state.running = false;
  clearTimers();
  removeAllDucks();

  if (state.score > state.highScore) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
  }

  renderHUD();

  const outcome = timeUp ? "Time's up!" : "Too many misses!";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>${outcome}</h1>
    <p>Final score: <strong>${state.score}</strong></p>
    <p>Best score: <strong>${state.highScore}</strong></p>
    <p>${state.score >= 300 ? "Elite hunter." : "Try again for a higher score."}</p>
    <button id="startBtn" type="button">Play Again</button>
  `;
}

function showCrosshair(event) {
  if (!messageEl.hidden) return;

  const rect = gameArea.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  crosshair.style.left = `${x}px`;
  crosshair.style.top = `${y}px`;
  crosshair.classList.remove("show");
  void crosshair.offsetWidth;
  crosshair.classList.add("show");

  const tappedDuck = event.target.closest(".duck");
  if (!tappedDuck && state.running && !state.paused) {
    registerMiss();
  }
}

messageEl.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});
messageEl.addEventListener("click", (event) => {
  const startButton = event.target.closest("#startBtn");
  if (startButton) {
    event.stopPropagation();
    startGame();
  }
});
pauseBtn.addEventListener("click", pauseResume);
restartBtn.addEventListener("click", startGame);
gameArea.addEventListener("pointerdown", showCrosshair);
gameArea.addEventListener(
  "touchmove",
  (event) => {
    if (state.running && !state.paused) {
      event.preventDefault();
    }
  },
  { passive: false }
);
let lastTouchTime = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchTime < 300) {
      event.preventDefault();
    }
    lastTouchTime = now;
  },
  { passive: false }
);

resetState();
