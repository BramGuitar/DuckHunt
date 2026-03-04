const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const timeEl = document.getElementById("time");
const missesEl = document.getElementById("misses");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const shieldsEl = document.getElementById("shields");
const accuracyEl = document.getElementById("accuracy");
const effectsEl = document.getElementById("effects");
const messageEl = document.getElementById("message");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const crosshair = document.getElementById("crosshair");
const toastEl = document.getElementById("toast");

const HIGH_SCORE_KEY = "duck-hunt-high-score";
const LEADERBOARD_KEY = "duck-hunt-leaderboard";
const SETTINGS_KEY = "duck-hunt-settings";

const baseSettings = {
  gameSeconds: 50,
  maxMisses: 8,
  spawnMs: 870,
  minSpawnMs: 300,
  targetLifeMs: 2400,
  minusDuckChance: 0.15,
  clockChance: 0.04,
  shieldChance: 0.08,
  slowChance: 0.08,
  minusPoints: 25,
  clockBonusSeconds: 10,
  maxShields: 3,
};

const modes = {
  easy: { label: "Easy", timeMult: 1.25, missBonus: 2, spawnMult: 1.2, scoreMult: 0.9 },
  normal: { label: "Normal", timeMult: 1, missBonus: 0, spawnMult: 1, scoreMult: 1 },
  hard: { label: "Hard", timeMult: 0.85, missBonus: -2, spawnMult: 0.82, scoreMult: 1.35 },
};

const state = {
  score: 0,
  misses: 0,
  combo: 0,
  level: 1,
  shields: 0,
  shots: 0,
  hits: 0,
  timeLeft: baseSettings.gameSeconds,
  highScore: getSavedHighScore(),
  leaderboard: getSavedLeaderboard(),
  mode: "normal",
  running: false,
  paused: false,
  scoreSaved: false,
  spawnDelay: baseSettings.spawnMs,
  currentSettings: { ...baseSettings },
  soundOn: true,
  hapticsOn: true,
  effects: {
    frenzyUntil: 0,
    slowUntil: 0,
    slowApplied: false,
  },
  timers: {
    spawner: null,
    clock: null,
    effects: null,
    toast: null,
  },
  audioCtx: null,
};

loadUserSettings();

function loadUserSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.soundOn === "boolean") state.soundOn = parsed.soundOn;
    if (typeof parsed.hapticsOn === "boolean") state.hapticsOn = parsed.hapticsOn;
    if (typeof parsed.mode === "string" && modes[parsed.mode]) state.mode = parsed.mode;
  } catch {
    // Ignore invalid settings.
  }
}

function saveUserSettings() {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ soundOn: state.soundOn, hapticsOn: state.hapticsOn, mode: state.mode })
    );
  } catch {
    // Ignore storage issues.
  }
}

function getSavedHighScore() {
  try {
    const value = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Ignore storage issues.
  }
}

function getSavedLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((entry) => entry && typeof entry.name === "string" && Number.isFinite(entry.score))
      .map((entry) => ({
        name: entry.name.slice(0, 12),
        score: Math.max(0, Math.floor(entry.score)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveLeaderboard(list) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage issues.
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  if (state.timers.toast) clearTimeout(state.timers.toast);
  state.timers.toast = setTimeout(() => toastEl.classList.remove("show"), 1200);
}

function getAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new window.AudioContext();
  }
  return state.audioCtx;
}

function playTone(freq, ms, type = "sine", gainValue = 0.04) {
  if (!state.soundOn) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    // Audio can fail on restricted environments.
  }
}

function buzz(ms) {
  if (!state.hapticsOn) return;
  if (navigator.vibrate) navigator.vibrate(ms);
}

function leaderboardMarkup() {
  if (state.leaderboard.length === 0) {
    return "<p class=\"leaderboard-empty\">No scores yet. Be first.</p>";
  }
  const top = state.leaderboard
    .slice(0, 6)
    .map(
      (entry, index) =>
        `<li><span>${index + 1}. ${escapeHtml(entry.name)}</span><strong>${entry.score}</strong></li>`
    )
    .join("");
  return `<ol class=\"leaderboard-list\">${top}</ol>`;
}

function modeSelectorMarkup() {
  return Object.entries(modes)
    .map(
      ([key, mode]) =>
        `<button type=\"button\" class=\"mini-btn ${state.mode === key ? "active" : ""}\" data-mode=\"${key}\">${mode.label}</button>`
    )
    .join("");
}

function renderHomeMenu() {
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Duck Hunt Ultimate</h1>
    <p>Duck = points. Red duck = penalty.</p>
    <p>⏰ is rare (+10s). 🛡️ adds shield, ❄️ triggers slow-mo.</p>
    <p>Every 6-hit streak gives bonus time and score.</p>
    <div class="menu-row">
      <span>Mode</span>
      <div class="mini-group">${modeSelectorMarkup()}</div>
    </div>
    <div class="menu-row">
      <span>Sound</span>
      <button type="button" class="mini-btn ${state.soundOn ? "active" : ""}" data-toggle="sound">${
        state.soundOn ? "On" : "Off"
      }</button>
    </div>
    <div class="menu-row">
      <span>Haptics</span>
      <button type="button" class="mini-btn ${state.hapticsOn ? "active" : ""}" data-toggle="haptics">${
        state.hapticsOn ? "On" : "Off"
      }</button>
    </div>
    <h2 class="leaderboard-title">Leaderboard</h2>
    ${leaderboardMarkup()}
    <button id="startBtn" type="button">Start Hunt</button>
  `;
}

function renderEndMenu(timeUp) {
  const outcome = timeUp ? "Time's up!" : "Out of misses!";
  const accuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 0;
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>${outcome}</h1>
    <p>Final score: <strong>${state.score}</strong></p>
    <p>Best score: <strong>${state.highScore}</strong></p>
    <p>Accuracy: <strong>${accuracy}%</strong></p>
    <div class="save-score">
      <input id="playerName" type="text" maxlength="12" placeholder="Your name" autocomplete="off" />
      <button id="saveScoreBtn" type="button">Save</button>
    </div>
    <p id="saveStatus" class="save-status" aria-live="polite"></p>
    <h2 class="leaderboard-title">Leaderboard</h2>
    ${leaderboardMarkup()}
    <button id="startBtn" type="button">Play Again</button>
  `;
}

function applyModeSettings() {
  const m = modes[state.mode];
  state.currentSettings = {
    ...baseSettings,
    gameSeconds: Math.round(baseSettings.gameSeconds * m.timeMult),
    maxMisses: Math.max(3, baseSettings.maxMisses + m.missBonus),
    spawnMs: Math.round(baseSettings.spawnMs * m.spawnMult),
    minSpawnMs: Math.round(baseSettings.minSpawnMs * m.spawnMult),
  };
}

function resetState() {
  applyModeSettings();
  state.score = 0;
  state.misses = 0;
  state.combo = 0;
  state.level = 1;
  state.shields = 0;
  state.shots = 0;
  state.hits = 0;
  state.timeLeft = state.currentSettings.gameSeconds;
  state.spawnDelay = state.currentSettings.spawnMs;
  state.running = false;
  state.paused = false;
  state.scoreSaved = false;
  state.effects.frenzyUntil = 0;
  state.effects.slowUntil = 0;
  state.effects.slowApplied = false;
  clearTimers();
  removeAllTargets();
  renderHUD();
}

function getMultiplier() {
  if (state.combo >= 12) return 4;
  if (state.combo >= 8) return 3;
  if (state.combo >= 4) return 2;
  return 1;
}

function isFrenzyActive() {
  return Date.now() < state.effects.frenzyUntil;
}

function isSlowActive() {
  return Date.now() < state.effects.slowUntil;
}

function renderHUD() {
  scoreEl.textContent = String(state.score);
  highScoreEl.textContent = String(state.highScore);
  timeEl.textContent = String(state.timeLeft);
  missesEl.textContent = `${state.misses}/${state.currentSettings.maxMisses}`;
  comboEl.textContent = `x${getMultiplier()}`;
  levelEl.textContent = String(state.level);
  shieldsEl.textContent = String(state.shields);
  const accuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 0;
  accuracyEl.textContent = `${accuracy}%`;

  const effects = [];
  if (isFrenzyActive()) effects.push("FRENZY");
  if (isSlowActive()) effects.push("SLOW");
  effectsEl.textContent = effects.length ? effects.join(" + ") : "None";
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
  if (state.timers.effects) {
    clearInterval(state.timers.effects);
    state.timers.effects = null;
  }
}

function refreshSpawner() {
  if (state.timers.spawner) clearInterval(state.timers.spawner);

  let delay = state.spawnDelay;
  if (isSlowActive()) delay = Math.round(delay * 1.45);
  state.timers.spawner = setInterval(spawnTarget, delay);
}

function removeAllTargets() {
  for (const target of gameArea.querySelectorAll(".target")) {
    target.remove();
  }
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnParticles(x, y, symbol) {
  for (let i = 0; i < 6; i += 1) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = symbol;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty("--dx", `${randomInRange(-26, 26)}px`);
    p.style.setProperty("--dy", `${randomInRange(-42, -12)}px`);
    gameArea.appendChild(p);
    setTimeout(() => p.remove(), 420);
  }
}

function maybeIncreaseDifficulty() {
  const elapsed = state.currentSettings.gameSeconds - state.timeLeft;
  state.level = 1 + Math.floor(elapsed / 8);
  const targetDelay = Math.max(
    state.currentSettings.minSpawnMs,
    state.currentSettings.spawnMs - elapsed * 12
  );

  if (targetDelay < state.spawnDelay) {
    state.spawnDelay = targetDelay;
    refreshSpawner();
  }
}

function chooseTargetType() {
  const roll = Math.random();
  const levelBoost = Math.min(0.05, state.level * 0.004);
  const clutchClockBoost = state.timeLeft <= 8 ? 0.03 : 0;
  const clockChance = baseSettings.clockChance + clutchClockBoost;

  if (roll < clockChance) return "clock";
  if (roll < clockChance + baseSettings.shieldChance) return "shield";
  if (roll < clockChance + baseSettings.shieldChance + baseSettings.slowChance) return "slow";
  if (roll < clockChance + baseSettings.shieldChance + baseSettings.slowChance + baseSettings.minusDuckChance + levelBoost) {
    return "minus";
  }
  return "normal";
}

function hitScoreForNormal() {
  const modeMult = modes[state.mode].scoreMult;
  const frenzyMult = isFrenzyActive() ? 2 : 1;
  return Math.round(10 * getMultiplier() * modeMult * frenzyMult);
}

function activateSlowMo() {
  state.effects.slowUntil = Date.now() + 5000;
  state.effects.slowApplied = true;
  refreshSpawner();
  showToast("Slow-mo activated");
}

function activateFrenzyIfNeeded() {
  if (state.combo === 10) {
    state.effects.frenzyUntil = Date.now() + 6000;
    showToast("Frenzy mode");
    playTone(820, 120, "triangle", 0.05);
    buzz(30);
  }
}

function applyStreakBonus() {
  if (state.combo > 0 && state.combo % 6 === 0) {
    state.timeLeft = Math.min(140, state.timeLeft + 2);
    state.score += 15;
    showToast("Streak bonus +2s");
    playTone(720, 100, "triangle", 0.05);
  }
}

function spawnTarget() {
  if (!state.running || state.paused) return;

  const targetType = chooseTargetType();
  const symbolByType = {
    normal: "🦆",
    minus: "🦆",
    clock: "⏰",
    shield: "🛡️",
    slow: "❄️",
  };

  const target = document.createElement("button");
  target.className = `target ${targetType}`;
  target.type = "button";
  target.setAttribute("aria-label", `${targetType} target`);
  target.textContent = symbolByType[targetType] || "🦆";

  const rect = gameArea.getBoundingClientRect();
  const small = targetType === "clock" || targetType === "shield" || targetType === "slow";
  const size = small ? Math.min(58, Math.max(38, rect.width * 0.095)) : Math.min(70, Math.max(46, rect.width * 0.115));
  const x = randomInRange(2, Math.max(3, rect.width - size - 2));
  const y = randomInRange(20, Math.max(24, rect.height * 0.65 - size));
  const driftX = randomInRange(-24, 24);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  const lifeMs = small ? state.currentSettings.targetLifeMs - 700 : state.currentSettings.targetLifeMs;
  target.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${driftX}px, -14px)` },
      { transform: "translate(0, -26px)" },
    ],
    { duration: lifeMs, easing: "ease-out", fill: "forwards" }
  );

  let hit = false;
  target.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!state.running || state.paused || hit) return;
    hit = true;

    const hitX = event.clientX - rect.left;
    const hitY = event.clientY - rect.top;
    state.shots += 1;
    state.hits += 1;

    if (targetType === "minus") {
      state.score = Math.max(0, state.score - baseSettings.minusPoints);
      state.combo = 0;
      showToast("Penalty duck");
      playTone(180, 150, "sawtooth", 0.05);
      buzz(45);
      spawnParticles(hitX, hitY, "💥");
    } else if (targetType === "clock") {
      state.timeLeft = Math.min(140, state.timeLeft + baseSettings.clockBonusSeconds);
      showToast("+10s");
      playTone(640, 100, "triangle", 0.05);
      buzz(20);
      spawnParticles(hitX, hitY, "✨");
    } else if (targetType === "shield") {
      state.shields = Math.min(baseSettings.maxShields, state.shields + 1);
      state.score += 8;
      showToast("Shield +1");
      playTone(520, 120, "sine", 0.05);
      buzz(20);
      spawnParticles(hitX, hitY, "🛡️");
    } else if (targetType === "slow") {
      activateSlowMo();
      state.score += 6;
      playTone(360, 140, "sine", 0.05);
      buzz(16);
      spawnParticles(hitX, hitY, "❄️");
    } else {
      state.combo += 1;
      state.score += hitScoreForNormal();
      applyStreakBonus();
      activateFrenzyIfNeeded();
      playTone(420 + Math.min(280, state.combo * 25), 70, "triangle", 0.035);
      buzz(12);
      spawnParticles(hitX, hitY, "✨");
    }

    renderHUD();
    target.classList.add("hit");
    setTimeout(() => target.remove(), 120);
  });

  gameArea.appendChild(target);

  setTimeout(() => {
    if (target.isConnected && !hit && state.running && !state.paused) {
      target.remove();
      registerMiss();
    }
  }, lifeMs + 30);
}

function registerMiss() {
  if (state.shields > 0) {
    state.shields -= 1;
    state.combo = 0;
    showToast("Shield blocked miss");
    playTone(220, 100, "square", 0.03);
    buzz(20);
    renderHUD();
    return;
  }

  state.misses += 1;
  state.combo = 0;
  playTone(150, 140, "sawtooth", 0.05);
  buzz(35);
  renderHUD();

  if (state.misses >= state.currentSettings.maxMisses) {
    endGame(false);
  }
}

function tickClock() {
  if (!state.running || state.paused) return;
  state.timeLeft -= 1;
  if (state.timeLeft <= 0) {
    endGame(true);
    return;
  }
  maybeIncreaseDifficulty();
  renderHUD();
}

function startEffectsTicker() {
  if (state.timers.effects) clearInterval(state.timers.effects);
  state.timers.effects = setInterval(() => {
    if (!state.running || state.paused) return;
    const slowActive = isSlowActive();
    renderHUD();
    if (!slowActive && state.effects.slowApplied) {
      state.effects.slowApplied = false;
      refreshSpawner();
    }
  }, 300);
}

function startGame() {
  resetState();
  state.running = true;

  messageEl.hidden = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  pauseBtn.textContent = "Pause";

  spawnTarget();
  refreshSpawner();
  startEffectsTicker();
  state.timers.clock = setInterval(tickClock, 1000);
  playTone(480, 120, "triangle", 0.05);
}

function pauseResume() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (state.paused) {
    removeAllTargets();
    showToast("Paused");
    return;
  }

  showToast("Resumed");
  spawnTarget();
  refreshSpawner();
}

function saveCurrentScore(nameInput) {
  if (state.scoreSaved) return;

  const cleaned = String(nameInput || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 12);
  const name = cleaned || "Hunter";

  state.leaderboard.push({ name, score: state.score });
  state.leaderboard.sort((a, b) => b.score - a.score);
  state.leaderboard = state.leaderboard.slice(0, 10);
  saveLeaderboard(state.leaderboard);
  state.scoreSaved = true;

  renderEndMenu(state.timeLeft <= 0);
  const status = messageEl.querySelector("#saveStatus");
  if (status) status.textContent = "Score saved.";
}

function endGame(timeUp) {
  state.running = false;
  clearTimers();
  removeAllTargets();

  if (state.score > state.highScore) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
    showToast("New high score");
    playTone(780, 160, "triangle", 0.06);
  }

  renderHUD();
  renderEndMenu(timeUp);
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

  const tappedTarget = event.target.closest(".target");
  if (!tappedTarget && state.running && !state.paused) {
    state.shots += 1;
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
    return;
  }

  const saveButton = event.target.closest("#saveScoreBtn");
  if (saveButton) {
    event.stopPropagation();
    const nameInput = messageEl.querySelector("#playerName");
    saveCurrentScore(nameInput ? nameInput.value : "");
    return;
  }

  const toggleButton = event.target.closest("[data-toggle]");
  if (toggleButton) {
    const type = toggleButton.getAttribute("data-toggle");
    if (type === "sound") state.soundOn = !state.soundOn;
    if (type === "haptics") state.hapticsOn = !state.hapticsOn;
    saveUserSettings();
    renderHomeMenu();
    return;
  }

  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    const mode = modeButton.getAttribute("data-mode");
    if (mode && modes[mode]) {
      state.mode = mode;
      saveUserSettings();
      renderHomeMenu();
    }
  }
});

pauseBtn.addEventListener("click", pauseResume);
restartBtn.addEventListener("click", startGame);

gameArea.addEventListener("pointerdown", showCrosshair);
gameArea.addEventListener(
  "touchmove",
  (event) => {
    if (state.running && !state.paused) event.preventDefault();
  },
  { passive: false }
);

let lastTouchTime = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchTime < 300) event.preventDefault();
    lastTouchTime = now;
  },
  { passive: false }
);

resetState();
renderHomeMenu();
