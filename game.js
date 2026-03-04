const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const missesEl = document.getElementById("misses");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const crosshair = document.getElementById("crosshair");

const settings = {
  gameSeconds: 45,
  maxMisses: 8,
  spawnMs: 900,
  duckLifeMs: 2500,
};

const state = {
  score: 0,
  misses: 0,
  timeLeft: settings.gameSeconds,
  running: false,
  paused: false,
  timers: {
    spawner: null,
    clock: null,
  },
};

function resetState() {
  state.score = 0;
  state.misses = 0;
  state.timeLeft = settings.gameSeconds;
  state.running = false;
  state.paused = false;
  clearTimers();
  removeAllDucks();
  renderHUD();
}

function renderHUD() {
  scoreEl.textContent = String(state.score);
  timeEl.textContent = String(state.timeLeft);
  missesEl.textContent = String(state.misses);
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

function removeAllDucks() {
  for (const duck of gameArea.querySelectorAll(".duck")) {
    duck.remove();
  }
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnDuck() {
  if (!state.running || state.paused) return;

  const duck = document.createElement("button");
  duck.className = "duck";
  duck.type = "button";
  duck.setAttribute("aria-label", "Duck target");

  const rect = gameArea.getBoundingClientRect();
  const size = Math.min(66, Math.max(44, rect.width * 0.11));
  const x = randomInRange(2, Math.max(3, rect.width - size - 2));
  const y = randomInRange(20, Math.max(24, rect.height * 0.62 - size));
  const driftX = randomInRange(-16, 16);

  duck.style.left = `${x}px`;
  duck.style.top = `${y}px`;

  duck.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${driftX}px, -14px)` },
      { transform: "translate(0, -24px)" },
    ],
    {
      duration: settings.duckLifeMs,
      easing: "ease-out",
      fill: "forwards",
    }
  );

  let hit = false;
  duck.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!state.running || state.paused || hit) return;
    hit = true;
    state.score += 10;
    renderHUD();
    duck.classList.add("hit");
    setTimeout(() => duck.remove(), 120);
  });

  gameArea.appendChild(duck);

  setTimeout(() => {
    if (duck.isConnected && !hit && state.running && !state.paused) {
      duck.remove();
      registerMiss();
    }
  }, settings.duckLifeMs + 30);
}

function registerMiss() {
  state.misses += 1;
  renderHUD();
  if (state.misses >= settings.maxMisses) {
    endGame(false);
  }
}

function tickClock() {
  if (!state.running || state.paused) return;
  state.timeLeft -= 1;
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
  state.timers.spawner = setInterval(spawnDuck, settings.spawnMs);
  state.timers.clock = setInterval(tickClock, 1000);
}

function pauseResume() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (!state.paused) {
    spawnDuck();
  }
}

function endGame(timeUp) {
  state.running = false;
  clearTimers();
  removeAllDucks();

  const outcome = timeUp ? "Time's up!" : "Too many misses!";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>${outcome}</h1>
    <p>Final score: <strong>${state.score}</strong></p>
    <p>${state.score >= 200 ? "Sharp shooting!" : "Try again for a higher score."}</p>
    <button id="startBtn" type="button">Play Again</button>
  `;

  const playAgainBtn = messageEl.querySelector("#startBtn");
  playAgainBtn.addEventListener("click", startGame, { once: true });
}

function showCrosshair(event) {
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

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseResume);
restartBtn.addEventListener("click", startGame);
gameArea.addEventListener("pointerdown", showCrosshair);

resetState();
