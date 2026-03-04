const gameArea = document.getElementById("gameArea");
const messageEl = document.getElementById("message");
const crosshair = document.getElementById("crosshair");
const toastEl = document.getElementById("toast");
const ghostHudEl = document.getElementById("ghostHud");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const hud = {
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  time: document.getElementById("time"),
  misses: document.getElementById("misses"),
  combo: document.getElementById("combo"),
  level: document.getElementById("level"),
  coins: document.getElementById("coins"),
  effects: document.getElementById("effects"),
};

const KEYS = {
  profile: "duck-v2-profile",
  leaderboardLocal: "duck-v2-leaderboard-local",
  settings: "duck-v2-settings",
  missions: "duck-v2-missions",
  duel: "duck-v2-duel",
};

const ONLINE_LEADERBOARD_URL = "";

const BASE = {
  gameSeconds: 55,
  misses: 8,
  spawnMs: 860,
  minSpawnMs: 280,
  lifeMs: 2300,
  normalPoints: 10,
  minusPenalty: 24,
  clockSeconds: 10,
  clockChance: 0.03,
  minusChance: 0.17,
  shieldChance: 0.09,
  slowChance: 0.08,
  bossEveryLevels: 4,
};

const MODES = {
  easy: { label: "Easy", timeMult: 1.2, spawnMult: 1.18, missBonus: 2, scoreMult: 0.9 },
  normal: { label: "Normal", timeMult: 1, spawnMult: 1, missBonus: 0, scoreMult: 1 },
  hard: { label: "Hard", timeMult: 0.86, spawnMult: 0.84, missBonus: -2, scoreMult: 1.35 },
};

const CATALOG = [
  { id: "skin-classic", type: "skin", label: "Classic Duck", emoji: "🦆", cost: 0 },
  { id: "skin-gold", type: "skin", label: "Golden Duck", emoji: "🦢", cost: 220 },
  { id: "skin-robot", type: "skin", label: "Robot Duck", emoji: "🤖", cost: 380 },
  { id: "crosshair-classic", type: "crosshair", label: "Classic Crosshair", value: "classic", cost: 0 },
  { id: "crosshair-neon", type: "crosshair", label: "Neon Crosshair", value: "neon", cost: 240 },
  { id: "trail-spark", type: "trail", label: "Spark Trail", value: "✨", cost: 170 },
  { id: "trail-flame", type: "trail", label: "Flame Trail", value: "🔥", cost: 320 },
  { id: "badge-bronze", type: "badge", label: "Bronze Hunter", value: "🥉", cost: 150 },
  { id: "badge-silver", type: "badge", label: "Silver Hunter", value: "🥈", cost: 300 },
  { id: "badge-gold", type: "badge", label: "Gold Hunter", value: "🥇", cost: 500 },
];

const SKILLS = {
  combo_decay: { label: "Combo Grace", max: 3, baseCost: 180 },
  shield_cap: { label: "Shield Capacity", max: 3, baseCost: 200 },
  clock_value: { label: "Clock Value", max: 3, baseCost: 220 },
};

const WEEKLY_EVENTS = [
  { id: "clear-skies", label: "Clear Skies", note: "Balanced run." },
  { id: "storm-front", label: "Storm Front", note: "Targets move faster." },
  { id: "coin-rain", label: "Coin Rain", note: "Extra coins from hits." },
  { id: "iron-wings", label: "Iron Wings", note: "Penalty ducks hurt more." },
  { id: "time-crunch", label: "Time Crunch", note: "Less base time, better score multiplier." },
];

const state = {
  running: false,
  paused: false,
  mode: "normal",
  profile: loadProfile(),
  settings: loadSettings(),
  localBoard: loadLocalLeaderboard(),
  onlineBoard: [],
  missions: loadMissions(),
  weekly: null,
  seededRun: null,
  rng: Math.random,
  run: null,
  duelTarget: loadDuelTarget(),
  menuScreen: "home",
  timers: { spawn: null, clock: null, effect: null, toast: null },
  audioCtx: null,
  bgmTimer: null,
};

function loadProfile() {
  const fallback = {
    best: 0,
    coins: 0,
    unlocked: ["skin-classic", "crosshair-classic"],
    selected: { skin: "skin-classic", crosshair: "classic", trail: "✨", badge: "" },
    skills: { combo_decay: 0, shield_cap: 0, clock_value: 0 },
    badges: [],
    streak: { count: 0, lastDay: "" },
    weeklyBest: {},
  };
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return {
      ...fallback,
      ...data,
      selected: { ...fallback.selected, ...(data.selected || {}) },
      skills: { ...fallback.skills, ...(data.skills || {}) },
      streak: { ...fallback.streak, ...(data.streak || {}) },
    };
  } catch {
    return fallback;
  }
}

function saveProfile() {
  localStorage.setItem(KEYS.profile, JSON.stringify(state.profile));
}

function loadSettings() {
  const fallback = { sound: true, haptics: true };
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveSettings() {
  localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
}

function loadLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(KEYS.leaderboardLocal);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 30) : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard() {
  localStorage.setItem(KEYS.leaderboardLocal, JSON.stringify(state.localBoard.slice(0, 30)));
}

function loadMissions() {
  const today = todayKey();
  try {
    const raw = localStorage.getItem(KEYS.missions);
    if (!raw) return generateDailyMissions(today);
    const data = JSON.parse(raw);
    if (data.day !== today) return generateDailyMissions(today);
    return data;
  } catch {
    return generateDailyMissions(today);
  }
}

function saveMissions() {
  localStorage.setItem(KEYS.missions, JSON.stringify(state.missions));
}

function loadDuelTarget() {
  try {
    const raw = localStorage.getItem(KEYS.duel);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDuelTarget(target) {
  if (!target) {
    localStorage.removeItem(KEYS.duel);
    state.duelTarget = null;
    return;
  }
  state.duelTarget = target;
  localStorage.setItem(KEYS.duel, JSON.stringify(target));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function weekKey(date = new Date()) {
  const t = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function hashStr(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randint(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function getWeeklyEvent() {
  const key = weekKey();
  const idx = parseInt(hashStr(key).slice(0, 6), 16) % WEEKLY_EVENTS.length;
  return { ...WEEKLY_EVENTS[idx], week: key };
}

function applyWeeklyModifiers(base) {
  const cfg = { ...base };
  switch (state.weekly.id) {
    case "storm-front":
      cfg.spawnMs = Math.round(cfg.spawnMs * 0.9);
      cfg.minSpawnMs = Math.round(cfg.minSpawnMs * 0.9);
      cfg.lifeMs = Math.round(cfg.lifeMs * 0.88);
      break;
    case "coin-rain":
      cfg.coinMult = 1.4;
      break;
    case "iron-wings":
      cfg.minusPenalty += 8;
      break;
    case "time-crunch":
      cfg.gameSeconds -= 8;
      cfg.scoreMult = 1.2;
      break;
    default:
      break;
  }
  return cfg;
}

function generateDailyMissions(day) {
  const seed = parseInt(hashStr(`missions-${day}`).slice(0, 8), 16);
  const rng = mulberry32(seed);
  const pool = [
    { id: "score", label: "Score 500+", target: 500, reward: 80 },
    { id: "hits", label: "Hit 35 targets", target: 35, reward: 70 },
    { id: "combo", label: "Reach combo x4", target: 4, reward: 65 },
    { id: "clocks", label: "Collect 2 clocks", target: 2, reward: 90 },
    { id: "boss", label: "Defeat 1 boss", target: 1, reward: 100 },
  ];
  const picks = [];
  while (picks.length < 3) {
    const candidate = pool[randint(0, pool.length - 1, rng)];
    if (!picks.find((x) => x.id === candidate.id)) {
      picks.push({ ...candidate, progress: 0, claimed: false, done: false });
    }
  }
  return { day, list: picks };
}

function missionProgress(id, value) {
  for (const m of state.missions.list) {
    if (m.id !== id || m.done) continue;
    m.progress = Math.max(m.progress, value);
    if (m.progress >= m.target) {
      m.done = true;
      toast(`Mission ready: ${m.label}`);
    }
  }
  saveMissions();
}

function claimMission(id) {
  const mission = state.missions.list.find((m) => m.id === id);
  if (!mission || !mission.done || mission.claimed) return;
  mission.claimed = true;
  state.profile.coins += mission.reward;
  saveMissions();
  saveProfile();
  renderHud();
  toast(`+${mission.reward} coins`);
}

function updateStreak() {
  const today = todayKey();
  const last = state.profile.streak.lastDay;
  if (last === today) return;

  const d1 = new Date(`${today}T00:00:00Z`);
  const d0 = last ? new Date(`${last}T00:00:00Z`) : null;
  const delta = d0 ? Math.round((d1 - d0) / 86400000) : 999;

  if (delta === 1) state.profile.streak.count += 1;
  else state.profile.streak.count = 1;

  state.profile.streak.lastDay = today;
  const reward = Math.min(120, 20 + state.profile.streak.count * 5);
  state.profile.coins += reward;
  saveProfile();
  toast(`Daily streak +${reward} coins`);
}

function badgeUnlock(id) {
  if (!state.profile.badges.includes(id)) {
    state.profile.badges.push(id);
    toast(`Badge unlocked: ${id}`);
    saveProfile();
  }
}

function selectedSkinEmoji() {
  const skin = CATALOG.find((x) => x.id === state.profile.selected.skin);
  return skin ? skin.emoji : "🦆";
}

function currentModeConfig() {
  const mode = MODES[state.mode];
  let cfg = {
    ...BASE,
    gameSeconds: Math.round(BASE.gameSeconds * mode.timeMult),
    spawnMs: Math.round(BASE.spawnMs * mode.spawnMult),
    minSpawnMs: Math.round(BASE.minSpawnMs * mode.spawnMult),
    misses: Math.max(3, BASE.misses + mode.missBonus),
    scoreMult: mode.scoreMult,
    coinMult: 1,
  };

  cfg.clockSeconds += state.profile.skills.clock_value * 2;
  cfg.maxShields = 3 + state.profile.skills.shield_cap;
  cfg.comboGrace = 1000 + state.profile.skills.combo_decay * 350;

  cfg = applyWeeklyModifiers(cfg);
  return cfg;
}

function beginRun(seedOverride = null) {
  const config = currentModeConfig();
  const seed = seedOverride ?? (Date.now() & 0xffffffff);
  const rng = mulberry32(seed);

  state.run = {
    seed,
    rng,
    config,
    score: 0,
    bestThisRun: 0,
    coinsEarned: 0,
    combo: 0,
    comboStreak: 0,
    misses: 0,
    hits: 0,
    shots: 0,
    clocks: 0,
    bossesDown: 0,
    timeLeft: config.gameSeconds,
    spawnDelay: config.spawnMs,
    level: 1,
    shields: 0,
    effects: { frenzyUntil: 0, slowUntil: 0 },
    slowApplied: false,
    lastHitAt: 0,
    boss: null,
    antiCheatLog: [],
    duelGhostScore: 0,
    gameOver: false,
  };
}

function isFx(name) {
  if (!state.run) return false;
  const now = Date.now();
  if (name === "frenzy") return now < state.run.effects.frenzyUntil;
  if (name === "slow") return now < state.run.effects.slowUntil;
  return false;
}

function setFx(name, ms) {
  state.run.effects[`${name}Until`] = Date.now() + ms;
  if (name === "slow") {
    state.run.slowApplied = true;
    restartSpawner();
  }
}

function clearTimers() {
  if (state.timers.spawn) clearInterval(state.timers.spawn);
  if (state.timers.clock) clearInterval(state.timers.clock);
  if (state.timers.effect) clearInterval(state.timers.effect);
  state.timers.spawn = null;
  state.timers.clock = null;
  state.timers.effect = null;
}

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  if (state.timers.toast) clearTimeout(state.timers.toast);
  state.timers.toast = setTimeout(() => toastEl.classList.remove("show"), 1200);
}

function getAudio() {
  if (!state.audioCtx) state.audioCtx = new window.AudioContext();
  return state.audioCtx;
}

function tone(freq, ms, type = "sine", gain = 0.04) {
  if (!state.settings.sound) return;
  try {
    const ctx = getAudio();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    // Ignore audio failures.
  }
}

function vibrate(ms) {
  if (state.settings.haptics && navigator.vibrate) navigator.vibrate(ms);
}

function startBgm() {
  if (!state.settings.sound) return;
  if (state.bgmTimer) clearInterval(state.bgmTimer);
  state.bgmTimer = setInterval(() => {
    if (!state.running || state.paused) return;
    tone(110, 80, "triangle", 0.015);
  }, 1800);
}

function stopBgm() {
  if (state.bgmTimer) clearInterval(state.bgmTimer);
  state.bgmTimer = null;
}

function renderHud() {
  const run = state.run;
  hud.best.textContent = String(state.profile.best);
  hud.coins.textContent = String(state.profile.coins);

  if (!run) {
    hud.score.textContent = "0";
    hud.time.textContent = "0";
    hud.misses.textContent = "0/0";
    hud.combo.textContent = "x1";
    hud.level.textContent = "1";
    hud.effects.textContent = "None";
    return;
  }

  const fx = [];
  if (isFx("frenzy")) fx.push("FRENZY");
  if (isFx("slow")) fx.push("SLOW");

  hud.score.textContent = String(run.score);
  hud.time.textContent = String(run.timeLeft);
  hud.misses.textContent = `${run.misses}/${run.config.misses}`;
  hud.combo.textContent = `x${comboMult()}`;
  hud.level.textContent = String(run.level);
  hud.effects.textContent = fx.length ? fx.join("+") : "None";
}

function comboMult() {
  const c = state.run.combo;
  if (c >= 14) return 5;
  if (c >= 10) return 4;
  if (c >= 6) return 3;
  if (c >= 3) return 2;
  return 1;
}

function modeButtons() {
  return Object.entries(MODES)
    .map(([k, m]) => `<button class="mini-btn ${state.mode === k ? "active" : ""}" data-mode="${k}">${m.label}</button>`)
    .join("");
}

function missionMarkup() {
  return state.missions.list
    .map((m) => {
      const pct = Math.min(100, Math.floor((m.progress / m.target) * 100));
      const action = m.done && !m.claimed
        ? `<button class="mini-btn active" data-claim="${m.id}">Claim +${m.reward}</button>`
        : `<span>${m.claimed ? "Claimed" : `${m.progress}/${m.target}`}</span>`;
      return `<li><div><strong>${m.label}</strong><small>${pct}%</small></div>${action}</li>`;
    })
    .join("");
}

function boardMarkup(list) {
  if (!list.length) return `<p class="leaderboard-empty">No scores yet</p>`;
  return `<ol class="leaderboard-list">${list
    .slice(0, 6)
    .map((x, i) => `<li><span>${i + 1}. ${escapeHtml(x.name || "Hunter")}</span><strong>${x.score}</strong></li>`)
    .join("")}</ol>`;
}

function shopMarkup() {
  const rows = CATALOG.map((item) => {
    const owned = state.profile.unlocked.includes(item.id);
    const selected = item.type === "skin"
      ? state.profile.selected.skin === item.id
      : item.type === "crosshair"
      ? state.profile.selected.crosshair === item.value
      : item.type === "trail"
      ? state.profile.selected.trail === item.value
      : state.profile.selected.badge === item.value;

    const btn = owned
      ? `<button class="mini-btn ${selected ? "active" : ""}" data-select="${item.id}">${selected ? "Selected" : "Use"}</button>`
      : `<button class="mini-btn" data-buy="${item.id}">Buy ${item.cost}</button>`;

    return `<li><span>${item.emoji || item.value || "•"} ${item.label}</span>${btn}</li>`;
  }).join("");

  return `<ul class="menu-list">${rows}</ul>`;
}

function skillMarkup() {
  const rows = Object.entries(SKILLS).map(([id, def]) => {
    const lvl = state.profile.skills[id];
    const cost = def.baseCost * (lvl + 1);
    const can = lvl < def.max;
    return `<li><span>${def.label} Lv.${lvl}/${def.max}</span>${can
      ? `<button class="mini-btn" data-skill="${id}">Upgrade ${cost}</button>`
      : `<button class="mini-btn active" disabled>Max</button>`}</li>`;
  }).join("");
  return `<ul class="menu-list">${rows}</ul>`;
}

function renderMainMenu() {
  const event = state.weekly;
  const duel = state.duelTarget ? `
    <div class="menu-row"><span>Duel</span><span>${escapeHtml(state.duelTarget.name)} (${state.duelTarget.score})</span></div>
  ` : "";

  state.menuScreen = "home";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Duck Hunt Next Level</h1>
    <p>${event.label}: ${event.note}</p>
    <div class="menu-row"><span>Mode</span><div class="mini-group">${modeButtons()}</div></div>
    <div class="menu-row"><span>Sound</span><button class="mini-btn ${state.settings.sound ? "active" : ""}" data-toggle="sound">${state.settings.sound ? "On" : "Off"}</button></div>
    <div class="menu-row"><span>Haptics</span><button class="mini-btn ${state.settings.haptics ? "active" : ""}" data-toggle="haptics">${state.settings.haptics ? "On" : "Off"}</button></div>
    ${duel}
    <h2>Daily Missions</h2>
    <ul class="menu-list">${missionMarkup()}</ul>
    <div class="menu-row"><span>Economy + Shop</span><button class="mini-btn active" data-open-shop="1">Open Shop</button></div>
    <h2>Leaderboard (Local)</h2>
    ${boardMarkup(state.localBoard)}
    <h2>Leaderboard (Online)</h2>
    ${boardMarkup(state.onlineBoard)}
    <div class="menu-row"><input id="duelCodeInput" class="menu-input" placeholder="Paste duel code" /><button class="mini-btn" data-import-duel="1">Load Duel</button></div>
    <button id="startBtn" type="button">Start Hunt</button>
  `;
}

function renderShopMenu() {
  state.menuScreen = "shop";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Shop & Economy</h1>
    <div class="menu-row"><span>Total Coins</span><strong>${state.profile.coins}</strong></div>
    <h2>Skill Tree Upgrades</h2>
    ${skillMarkup()}
    <h2>Cosmetics & Unlocks</h2>
    ${shopMarkup()}
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">Start Hunt</button>
  `;
}

function endMenu(reason) {
  const run = state.run;
  const acc = run.shots ? Math.round((run.hits / run.shots) * 100) : 0;
  const challenge = exportChallengeCode();

  state.menuScreen = "end";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>${reason}</h1>
    <p>Score <strong>${run.score}</strong> | Coins +<strong>${run.coinsEarned}</strong></p>
    <p>Accuracy <strong>${acc}%</strong> | Bosses <strong>${run.bossesDown}</strong></p>
    <div class="save-score">
      <input id="playerName" maxlength="12" placeholder="Your name" />
      <button id="saveScoreBtn" type="button">Save</button>
    </div>
    <div class="menu-row"><input id="challengeCode" class="menu-input" value="${challenge}" readonly /><button class="mini-btn" data-copy="challenge">Copy Code</button></div>
    <button class="mini-btn active" data-open-shop="1">Go to Shop</button>
    <p class="save-status" id="saveStatus"></p>
    <button id="startBtn" type="button">Play Again</button>
  `;
}

function particle(x, y, symbol) {
  const trail = state.profile.selected.trail || "✨";
  for (let i = 0; i < 6; i += 1) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = symbol || trail;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty("--dx", `${(state.run.rng() * 52 - 26).toFixed(2)}px`);
    p.style.setProperty("--dy", `${(state.run.rng() * -34 - 10).toFixed(2)}px`);
    gameArea.appendChild(p);
    setTimeout(() => p.remove(), 420);
  }
}

function spawnType() {
  const r = state.run.rng();
  const clutch = state.run.timeLeft <= 8 ? 0.02 : 0;
  const c = state.run.config.clockChance + clutch;
  if (r < c) return "clock";
  if (r < c + state.run.config.shieldChance) return "shield";
  if (r < c + state.run.config.shieldChance + state.run.config.slowChance) return "slow";
  if (r < c + state.run.config.shieldChance + state.run.config.slowChance + state.run.config.minusChance) return "minus";
  return "duck";
}

function bossMaybe() {
  if (state.run.boss || state.run.level % BASE.bossEveryLevels !== 0) return;
  if (state.run.level === 0) return;
  spawnTarget("boss");
}

function spawnTarget(forceType = null) {
  if (!state.running || state.paused || state.run.gameOver) return;

  const type = forceType || spawnType();
  const symbols = {
    duck: selectedSkinEmoji(),
    minus: "🦆",
    clock: "⏰",
    shield: "🛡️",
    slow: "❄️",
    boss: "🦅",
  };

  const target = document.createElement("button");
  target.className = `target ${type}`;
  target.type = "button";
  target.textContent = symbols[type] || "🦆";

  const rect = gameArea.getBoundingClientRect();
  const small = ["clock", "shield", "slow"].includes(type);
  const boss = type === "boss";
  const size = boss
    ? Math.min(94, Math.max(74, rect.width * 0.18))
    : small
    ? Math.min(58, Math.max(38, rect.width * 0.095))
    : Math.min(72, Math.max(46, rect.width * 0.115));

  const x = state.run.rng() * (rect.width - size - 8) + 4;
  const y = state.run.rng() * (rect.height * 0.62 - size - 16) + 16;

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  const driftX = (state.run.rng() * 48 - 24);
  const lifeMs = boss ? state.run.config.lifeMs + 1800 : (small ? state.run.config.lifeMs - 650 : state.run.config.lifeMs);

  target.animate([
    { transform: "translate(0, 0)" },
    { transform: `translate(${driftX}px, -14px)` },
    { transform: "translate(0, -24px)" },
  ], { duration: lifeMs, easing: "ease-out", fill: "forwards" });

  let hp = boss ? 8 + Math.floor(state.run.level / 2) : 1;
  if (boss) {
    state.run.boss = { hp, max: hp };
    toast("Boss wave");
    tone(220, 160, "sawtooth", 0.06);
  }

  let hit = false;
  target.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!state.running || state.paused || hit) return;

    state.run.shots += 1;
    state.run.hits += 1;
    state.run.lastHitAt = Date.now();

    const tx = event.clientX - rect.left;
    const ty = event.clientY - rect.top;

    if (boss) {
      hp -= 1;
      particle(tx, ty, "⚡");
      tone(280 + hp * 22, 70, "square", 0.05);
      vibrate(12);
      if (hp > 0) {
        toast(`Boss HP ${hp}`);
        return;
      }
      hit = true;
      state.run.boss = null;
      state.run.bossesDown += 1;
      state.run.score += 180 * state.run.config.scoreMult;
      state.run.coinsEarned += 45;
      missionProgress("boss", state.run.bossesDown);
      badgeUnlock("boss-slayer");
      toast("Boss defeated");
      tone(780, 140, "triangle", 0.06);
    } else if (type === "minus") {
      state.run.score = Math.max(0, state.run.score - state.run.config.minusPenalty);
      state.run.combo = 0;
      particle(tx, ty, "💥");
      tone(140, 130, "sawtooth", 0.06);
      vibrate(30);
    } else if (type === "clock") {
      hit = true;
      state.run.clocks += 1;
      state.run.timeLeft = Math.min(160, state.run.timeLeft + state.run.config.clockSeconds);
      state.run.score += 6;
      state.run.coinsEarned += 4;
      missionProgress("clocks", state.run.clocks);
      particle(tx, ty, "✨");
      toast(`+${state.run.config.clockSeconds}s`);
      tone(620, 120, "triangle", 0.05);
      vibrate(16);
    } else if (type === "shield") {
      hit = true;
      state.run.shields = Math.min(state.run.config.maxShields, state.run.shields + 1);
      state.run.score += 8;
      state.run.coinsEarned += 3;
      particle(tx, ty, "🛡️");
      toast("Shield +1");
      tone(500, 100, "sine", 0.05);
    } else if (type === "slow") {
      hit = true;
      setFx("slow", 5000);
      state.run.score += 10;
      state.run.coinsEarned += 4;
      particle(tx, ty, "❄️");
      toast("Slow motion");
      tone(360, 120, "sine", 0.05);
    } else {
      hit = true;
      state.run.combo += 1;
      state.run.comboStreak = Math.max(state.run.comboStreak, state.run.combo);
      const frenzyMult = isFx("frenzy") ? 2 : 1;
      const pts = Math.round(BASE.normalPoints * comboMult() * frenzyMult * state.run.config.scoreMult);
      state.run.score += pts;
      state.run.coinsEarned += Math.max(1, Math.round((1 + comboMult() / 2) * state.run.config.coinMult));
      if (state.run.combo > 0 && state.run.combo % 6 === 0) {
        state.run.timeLeft += 2;
        state.run.score += 15;
        toast("Streak bonus +2s");
      }
      if (state.run.combo === 10) {
        setFx("frenzy", 6000);
        toast("Frenzy");
      }
      missionProgress("hits", state.run.hits);
      missionProgress("combo", comboMult());
      particle(tx, ty, state.profile.selected.trail || "✨");
      tone(420 + Math.min(260, state.run.combo * 18), 65, "triangle", 0.03);
      vibrate(10);
    }

    state.run.bestThisRun = Math.max(state.run.bestThisRun, state.run.score);
    missionProgress("score", state.run.score);
    antiCheatTick("hit", type);
    renderHud();

    if (hit) {
      target.classList.add("hit");
      setTimeout(() => target.remove(), 120);
    }
  });

  gameArea.appendChild(target);

  setTimeout(() => {
    if (!target.isConnected || state.run.gameOver || !state.running || state.paused) return;

    if (boss) {
      state.run.boss = null;
      target.remove();
      missPenalty(2);
      toast("Boss escaped");
      return;
    }

    target.remove();
    missPenalty(1);
  }, lifeMs + 30);
}

function missPenalty(amount) {
  if (state.run.shields > 0) {
    state.run.shields -= 1;
    state.run.combo = 0;
    toast("Shield blocked");
    tone(220, 90, "square", 0.03);
    renderHud();
    return;
  }
  state.run.misses += amount;
  state.run.combo = 0;
  tone(150, 110, "sawtooth", 0.05);
  vibrate(25);
  antiCheatTick("miss", amount);
  renderHud();
  if (state.run.misses >= state.run.config.misses) {
    finishRun("Out of misses");
  }
}

function antiCheatTick(action, payload) {
  state.run.antiCheatLog.push(`${Date.now()}|${action}|${payload}|${state.run.score}|${state.run.timeLeft}`);
  if (state.run.antiCheatLog.length > 240) state.run.antiCheatLog.shift();
}

function runProof() {
  const sample = state.run.antiCheatLog.join(";");
  const base = [
    state.run.seed,
    state.mode,
    state.weekly.id,
    state.run.score,
    state.run.hits,
    state.run.shots,
    state.run.misses,
    sample,
  ].join("|");
  return hashStr(base);
}

function validateRunBeforeSubmit() {
  if (state.run.score < 0) return false;
  if (state.run.hits > state.run.shots) return false;
  if (state.run.timeLeft > 240) return false;
  if (state.run.score > 20000) return false;
  return true;
}

async function fetchOnlineBoard() {
  if (!ONLINE_LEADERBOARD_URL) {
    state.onlineBoard = [];
    return;
  }
  try {
    const res = await fetch(`${ONLINE_LEADERBOARD_URL}/top?game=duck-v2`, { method: "GET" });
    const data = await res.json();
    if (Array.isArray(data)) {
      state.onlineBoard = data.slice(0, 10);
    }
  } catch {
    state.onlineBoard = [];
  }
}

async function submitOnlineScore(name) {
  if (!ONLINE_LEADERBOARD_URL) return;
  if (!validateRunBeforeSubmit()) return;
  try {
    await fetch(`${ONLINE_LEADERBOARD_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: "duck-v2",
        name,
        score: state.run.score,
        mode: state.mode,
        week: state.weekly.week,
        proof: runProof(),
        seed: state.run.seed,
      }),
    });
  } catch {
    // Ignore network failures.
  }
}

function restartSpawner() {
  if (state.timers.spawn) clearInterval(state.timers.spawn);
  let delay = state.run.spawnDelay;
  if (isFx("slow")) delay = Math.round(delay * 1.45);
  state.timers.spawn = setInterval(spawnTarget, delay);
}

function tick() {
  if (!state.running || state.paused || state.run.gameOver) return;

  state.run.timeLeft -= 1;
  if (state.run.timeLeft <= 0) {
    finishRun("Time up");
    return;
  }

  const elapsed = state.run.config.gameSeconds - state.run.timeLeft;
  state.run.level = 1 + Math.floor(elapsed / 7);
  const targetDelay = Math.max(state.run.config.minSpawnMs, state.run.config.spawnMs - elapsed * 10);
  if (targetDelay < state.run.spawnDelay) {
    state.run.spawnDelay = targetDelay;
    restartSpawner();
  }

  if (Date.now() - state.run.lastHitAt > state.run.config.comboGrace) {
    state.run.combo = 0;
  }

  bossMaybe();
  updateGhost();
  renderHud();
}

function updateGhost() {
  if (!state.duelTarget || !state.running) {
    ghostHudEl.hidden = true;
    return;
  }

  const elapsed = state.run.config.gameSeconds - state.run.timeLeft;
  const progress = Math.max(0, Math.min(1, elapsed / state.run.config.gameSeconds));
  state.run.duelGhostScore = Math.floor(state.duelTarget.score * progress);
  ghostHudEl.hidden = false;
  ghostHudEl.textContent = `${escapeHtml(state.duelTarget.name)}: ${state.run.duelGhostScore}`;
}

function startRun(seed = null) {
  beginRun(seed);
  state.running = true;
  state.paused = false;

  messageEl.hidden = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  pauseBtn.textContent = "Pause";

  spawnTarget();
  restartSpawner();
  state.timers.clock = setInterval(tick, 1000);
  state.timers.effect = setInterval(() => {
    if (!state.running || state.paused) return;
    renderHud();
    updateGhost();
    if (!isFx("slow") && state.run.slowApplied) {
      state.run.slowApplied = false;
      restartSpawner();
    }
  }, 300);

  startBgm();
  tone(520, 120, "triangle", 0.05);
  renderHud();
}

function finishRun(reason) {
  if (!state.run || state.run.gameOver) return;
  state.run.gameOver = true;
  state.running = false;
  clearTimers();
  stopBgm();

  for (const el of gameArea.querySelectorAll(".target")) el.remove();

  state.profile.coins += state.run.coinsEarned;
  if (state.duelTarget && state.run.score > state.duelTarget.score) {
    state.profile.coins += 75;
    badgeUnlock("duel-winner");
    toast("Duel won +75 coins");
  }
  state.profile.best = Math.max(state.profile.best, state.run.score);

  const wk = state.weekly.week;
  state.profile.weeklyBest[wk] = Math.max(state.profile.weeklyBest[wk] || 0, state.run.score);

  if (state.run.score >= 1000) badgeUnlock("1000-club");
  if (state.run.hits >= 80) badgeUnlock("sharpshooter");

  saveProfile();
  renderHud();
  endMenu(reason);
}

function saveRunScore(name) {
  if (!state.run || !state.run.gameOver) return;
  const n = (name || "Hunter").trim().slice(0, 12) || "Hunter";
  state.localBoard.push({ name: n, score: state.run.score, mode: state.mode, week: state.weekly.week });
  state.localBoard.sort((a, b) => b.score - a.score);
  state.localBoard = state.localBoard.slice(0, 30);
  saveLocalLeaderboard();
  submitOnlineScore(n);

  const status = messageEl.querySelector("#saveStatus");
  if (status) status.textContent = "Score saved";
}

function exportChallengeCode() {
  if (!state.run) return "";
  const payload = {
    v: 1,
    seed: state.run.seed,
    mode: state.mode,
    week: state.weekly.week,
    score: state.run.score,
    name: "Hunter",
  };
  return btoa(JSON.stringify(payload));
}

function importChallengeCode(code) {
  try {
    const obj = JSON.parse(atob(code.trim()));
    if (!obj || typeof obj.score !== "number") throw new Error("bad");
    saveDuelTarget({ name: obj.name || "Rival", score: Math.max(0, Math.floor(obj.score)), seed: obj.seed || null });
    toast("Duel loaded");
    renderMainMenu();
  } catch {
    toast("Invalid duel code");
  }
}

function startDuelSeeded() {
  if (state.duelTarget && Number.isFinite(state.duelTarget.seed)) {
    startRun(state.duelTarget.seed >>> 0);
  } else {
    startRun();
  }
}

function canAfford(cost) {
  return state.profile.coins >= cost;
}

function buyItem(id) {
  const item = CATALOG.find((x) => x.id === id);
  if (!item) return;
  if (state.profile.unlocked.includes(id)) return;
  if (!canAfford(item.cost)) {
    toast("Not enough coins");
    return;
  }
  state.profile.coins -= item.cost;
  state.profile.unlocked.push(id);
  saveProfile();
  renderHud();
  toast(`Unlocked ${item.label}`);
  renderShopMenu();
}

function selectItem(id) {
  const item = CATALOG.find((x) => x.id === id);
  if (!item || !state.profile.unlocked.includes(id)) return;
  if (item.type === "skin") state.profile.selected.skin = item.id;
  if (item.type === "crosshair") state.profile.selected.crosshair = item.value;
  if (item.type === "trail") state.profile.selected.trail = item.value;
  if (item.type === "badge") state.profile.selected.badge = item.value;
  saveProfile();
  applyCosmetics();
  renderShopMenu();
}

function upgradeSkill(id) {
  const def = SKILLS[id];
  if (!def) return;
  const lvl = state.profile.skills[id];
  if (lvl >= def.max) return;
  const cost = def.baseCost * (lvl + 1);
  if (!canAfford(cost)) {
    toast("Not enough coins");
    return;
  }
  state.profile.coins -= cost;
  state.profile.skills[id] += 1;
  saveProfile();
  renderHud();
  toast(`${def.label} upgraded`);
  renderShopMenu();
}

function applyCosmetics() {
  crosshair.classList.remove("neon");
  if (state.profile.selected.crosshair === "neon") crosshair.classList.add("neon");
}

function pauseResume() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  if (state.paused) {
    toast("Paused");
  } else {
    toast("Resumed");
  }
}

function onGamePointer(event) {
  if (!state.running || state.paused || state.run.gameOver) return;

  const rect = gameArea.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  crosshair.style.left = `${x}px`;
  crosshair.style.top = `${y}px`;
  crosshair.classList.remove("show");
  void crosshair.offsetWidth;
  crosshair.classList.add("show");

  const target = event.target.closest(".target");
  if (!target) {
    state.run.shots += 1;
    missPenalty(1);
  }
}

function bindMenuEvents() {
  messageEl.addEventListener("pointerdown", (e) => e.stopPropagation());

  messageEl.addEventListener("click", (e) => {
    const startBtn = e.target.closest("#startBtn");
    if (startBtn) {
      startDuelSeeded();
      return;
    }

    const saveBtn = e.target.closest("#saveScoreBtn");
    if (saveBtn) {
      const n = messageEl.querySelector("#playerName");
      saveRunScore(n ? n.value : "Hunter");
      return;
    }

    const claimBtn = e.target.closest("[data-claim]");
    if (claimBtn) {
      claimMission(claimBtn.getAttribute("data-claim"));
      renderMainMenu();
      return;
    }

    const modeBtn = e.target.closest("[data-mode]");
    if (modeBtn) {
      const mode = modeBtn.getAttribute("data-mode");
      if (MODES[mode]) {
        state.mode = mode;
        renderMainMenu();
      }
      return;
    }

    const toggleBtn = e.target.closest("[data-toggle]");
    if (toggleBtn) {
      const t = toggleBtn.getAttribute("data-toggle");
      if (t === "sound") state.settings.sound = !state.settings.sound;
      if (t === "haptics") state.settings.haptics = !state.settings.haptics;
      saveSettings();
      renderMainMenu();
      return;
    }

    const openShopBtn = e.target.closest("[data-open-shop]");
    if (openShopBtn) {
      renderShopMenu();
      return;
    }

    const openHomeBtn = e.target.closest("[data-open-home]");
    if (openHomeBtn) {
      renderMainMenu();
      return;
    }

    const buyBtn = e.target.closest("[data-buy]");
    if (buyBtn) {
      buyItem(buyBtn.getAttribute("data-buy"));
      return;
    }

    const selectBtn = e.target.closest("[data-select]");
    if (selectBtn) {
      selectItem(selectBtn.getAttribute("data-select"));
      return;
    }

    const skillBtn = e.target.closest("[data-skill]");
    if (skillBtn) {
      upgradeSkill(skillBtn.getAttribute("data-skill"));
      return;
    }

    const importBtn = e.target.closest("[data-import-duel]");
    if (importBtn) {
      const inp = messageEl.querySelector("#duelCodeInput");
      if (inp) importChallengeCode(inp.value);
      return;
    }

    const copyBtn = e.target.closest("[data-copy='challenge']");
    if (copyBtn) {
      const inp = messageEl.querySelector("#challengeCode");
      if (inp) {
        inp.select();
        document.execCommand("copy");
        toast("Challenge copied");
      }
    }
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bootstrap() {
  state.weekly = getWeeklyEvent();
  state.missions = loadMissions();
  updateStreak();
  applyCosmetics();
  fetchOnlineBoard().finally(() => {
    renderHud();
    renderMainMenu();
  });

  pauseBtn.addEventListener("click", pauseResume);
  restartBtn.addEventListener("click", () => startDuelSeeded());

  gameArea.addEventListener("pointerdown", onGamePointer);
  gameArea.addEventListener("touchmove", (e) => {
    if (state.running && !state.paused) e.preventDefault();
  }, { passive: false });

  let lastTouch = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  bindMenuEvents();
}

bootstrap();
