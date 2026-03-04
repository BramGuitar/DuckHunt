const gameArea = document.getElementById("gameArea");
const messageEl = document.getElementById("message");
const crosshair = document.getElementById("crosshair");
const toastEl = document.getElementById("toast");
const ghostHudEl = document.getElementById("ghostHud");
const pauseBtn = document.getElementById("pauseBtn");
const abilityBtn = document.getElementById("abilityBtn");
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
  auth: "duck-v2-auth",
  telemetry: "duck-v2-telemetry",
};

const ONLINE_LEADERBOARD_URL = "";
const API_DEFAULT_URL = "";

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

const WEAPONS = {
  single: { label: "Single", scoreMult: 1 },
  spread: { label: "Spread", scoreMult: 0.95 },
  pierce: { label: "Pierce", scoreMult: 1.2 },
  burst: { label: "Burst", scoreMult: 1.05 },
};

const WEAPON_SHOP = [
  { id: "single", label: "Single", cost: 0, note: "Balanced" },
  { id: "spread", label: "Spread", cost: 260, note: "Splash bonus" },
  { id: "pierce", label: "Pierce", cost: 340, note: "High score multiplier" },
  { id: "burst", label: "Burst", cost: 300, note: "Extra hit bonus" },
];

const PERKS = {
  scavenger: { label: "Scavenger", desc: "+35% materials per run" },
  steady: { label: "Steady Hands", desc: "+500ms combo grace" },
  hunter: { label: "Hunter's Eye", desc: "+8% score multiplier" },
  clocksmith: { label: "Clocksmith", desc: "+1% clock spawn chance" },
};

const HERO_ABILITIES = {
  time_warp: { label: "Time Warp", cooldown: 28, desc: "Slow targets for 6s" },
  score_burst: { label: "Score Burst", cooldown: 24, desc: "Instant +120 score" },
  shield_surge: { label: "Shield Surge", cooldown: 26, desc: "+2 shields" },
  clear_hunt: { label: "Clear Hunt", cooldown: 30, desc: "Clear penalty targets" },
};

const DUCK_CLASSES = {
  basic: { label: "Basic", hp: 1 },
  armored: { label: "Armored", hp: 2 },
  teleport: { label: "Teleport", hp: 1 },
  split: { label: "Split", hp: 1 },
  decoy: { label: "Decoy", hp: 1 },
};

const CAMPAIGN_MAPS = [
  { id: "meadow", label: "Sunset Meadow", targetScore: 500, bossGoal: 1, modifier: { coinMult: 1.05 } },
  { id: "marsh", label: "Storm Marsh", targetScore: 650, bossGoal: 1, modifier: { minusPenalty: 4, spawnMs: -40 } },
  { id: "canyon", label: "Iron Canyon", targetScore: 820, bossGoal: 2, modifier: { scoreMult: 1.08, lifeMs: -120 } },
];

const CAMPAIGN_CHAPTERS = [
  {
    id: "pacific-flyway",
    title: "Pacific Flyway",
    theme: "West coast wetlands and mountain winds.",
    nodes: [
      "Washington", "Oregon", "California", "Nevada", "Utah",
      "Arizona", "New Mexico", "Colorado", "Wyoming", "Montana",
    ],
  },
  {
    id: "sunbelt-rush",
    title: "Sunbelt Rush",
    theme: "Hot southern skies with fast migration routes.",
    nodes: [
      "California", "Arizona", "Texas", "Louisiana", "Mississippi",
      "Alabama", "Georgia", "Florida", "South Carolina", "North Carolina",
    ],
  },
  {
    id: "heartland-circuit",
    title: "Heartland Circuit",
    theme: "Open plains, farm fields, and crosswinds.",
    nodes: [
      "North Dakota", "South Dakota", "Nebraska", "Kansas", "Iowa",
      "Missouri", "Illinois", "Indiana", "Ohio", "Michigan",
    ],
  },
  {
    id: "atlantic-ladder",
    title: "Atlantic Ladder",
    theme: "Dense eastern corridors and sharp angle flights.",
    nodes: [
      "Virginia", "North Carolina", "South Carolina", "Georgia", "Tennessee",
      "Kentucky", "Pennsylvania", "New York", "Vermont", "Maine",
    ],
  },
  {
    id: "great-lakes-gauntlet",
    title: "Great Lakes Gauntlet",
    theme: "Cold fronts, lake gusts, and tricky duck patterns.",
    nodes: [
      "Minnesota", "Wisconsin", "Michigan", "Ohio", "Kentucky",
      "Tennessee", "Arkansas", "Oklahoma", "Kansas", "Nebraska",
    ],
  },
  {
    id: "mountain-iron-trail",
    title: "Mountain Iron Trail",
    theme: "High-altitude routes and pressure-heavy finales.",
    nodes: [
      "Idaho", "Montana", "Wyoming", "Colorado", "New Mexico",
      "Texas", "Oklahoma", "Kansas", "Nebraska", "South Dakota",
    ],
  },
];

const STATE_GEO = {
  Alabama: { lat: 32.8067, lon: -86.7911 },
  Arizona: { lat: 34.0489, lon: -111.0937 },
  Arkansas: { lat: 34.9697, lon: -92.3731 },
  California: { lat: 36.7783, lon: -119.4179 },
  Colorado: { lat: 39.5501, lon: -105.7821 },
  Connecticut: { lat: 41.6032, lon: -73.0877 },
  Florida: { lat: 27.6648, lon: -81.5158 },
  Georgia: { lat: 32.1656, lon: -82.9001 },
  Idaho: { lat: 44.0682, lon: -114.742 },
  Illinois: { lat: 40.6331, lon: -89.3985 },
  Indiana: { lat: 40.2672, lon: -86.1349 },
  Iowa: { lat: 41.878, lon: -93.0977 },
  Kansas: { lat: 39.0119, lon: -98.4842 },
  Kentucky: { lat: 37.8393, lon: -84.27 },
  Louisiana: { lat: 31.2448, lon: -92.145 },
  Maine: { lat: 45.2538, lon: -69.4455 },
  Maryland: { lat: 39.0458, lon: -76.6413 },
  Massachusetts: { lat: 42.4072, lon: -71.3824 },
  Michigan: { lat: 44.3148, lon: -85.6024 },
  Minnesota: { lat: 46.7296, lon: -94.6859 },
  Mississippi: { lat: 32.3547, lon: -89.3985 },
  Missouri: { lat: 37.9643, lon: -91.8318 },
  Montana: { lat: 46.8797, lon: -110.3626 },
  Nebraska: { lat: 41.4925, lon: -99.9018 },
  Nevada: { lat: 38.8026, lon: -116.4194 },
  "New Hampshire": { lat: 43.1939, lon: -71.5724 },
  "New Jersey": { lat: 40.0583, lon: -74.4057 },
  "New Mexico": { lat: 34.5199, lon: -105.8701 },
  "New York": { lat: 43.2994, lon: -74.2179 },
  "North Carolina": { lat: 35.7596, lon: -79.0193 },
  "North Dakota": { lat: 47.5515, lon: -101.002 },
  Ohio: { lat: 40.4173, lon: -82.9071 },
  Oklahoma: { lat: 35.0078, lon: -97.0929 },
  Oregon: { lat: 43.8041, lon: -120.5542 },
  Pennsylvania: { lat: 41.2033, lon: -77.1945 },
  "South Carolina": { lat: 33.8361, lon: -81.1637 },
  "South Dakota": { lat: 43.9695, lon: -99.9018 },
  Tennessee: { lat: 35.5175, lon: -86.5804 },
  Texas: { lat: 31.9686, lon: -99.9018 },
  Utah: { lat: 39.321, lon: -111.0937 },
  Vermont: { lat: 44.5588, lon: -72.5778 },
  Virginia: { lat: 37.4316, lon: -78.6569 },
  Washington: { lat: 47.7511, lon: -120.7401 },
  Wisconsin: { lat: 43.7844, lon: -88.7879 },
  Wyoming: { lat: 43.076, lon: -107.2903 },
};

const STATE_MAP_OFFSET = {
  Connecticut: { x: 1.8, y: -0.5 },
  Massachusetts: { x: 2.3, y: -0.8 },
  Maryland: { x: 1.1, y: 0.9 },
  "New Hampshire": { x: 2.6, y: -1.2 },
  "New Jersey": { x: 1.6, y: 0.4 },
  "New York": { x: -0.8, y: -0.6 },
  Pennsylvania: { x: -0.3, y: 0.5 },
  Vermont: { x: 1.8, y: -1.4 },
  Virginia: { x: -0.8, y: 0.8 },
};

const RECIPES = {
  forge_core: { label: "Forge Core", cost: { feather: 25, gear: 12 }, reward: { core: 1 } },
  polish_skin: { label: "Polish Skin", cost: { feather: 18, core: 1 }, reward: { coins: 120 } },
};

const TOURNAMENTS = [
  { id: "weekend-rush", label: "Weekend Rush", target: 900, reward: 180, scoreMult: 1.1, coinMult: 1.2 },
  { id: "boss-hunt", label: "Boss Hunt", target: 700, reward: 220, scoreMult: 1.05, coinMult: 1.1 },
  { id: "precision-cup", label: "Precision Cup", target: 1000, reward: 260, scoreMult: 1.15, coinMult: 1.05 },
];

const WEATHER_PRESETS = [
  { id: "clear", label: "Clear", spawnMult: 1, lifeMult: 1, clockBoost: 0 },
  { id: "windy", label: "Windy", spawnMult: 1.08, lifeMult: 0.93, clockBoost: 0 },
  { id: "rain", label: "Rain", spawnMult: 0.94, lifeMult: 0.9, clockBoost: 0.01 },
  { id: "fog", label: "Fog", spawnMult: 1, lifeMult: 0.96, clockBoost: 0 },
  { id: "storm", label: "Storm", spawnMult: 1.14, lifeMult: 0.86, clockBoost: -0.005 },
];

const BATTLE_PASS_TIERS = [
  { tier: 1, xp: 120, reward: 80 },
  { tier: 2, xp: 300, reward: 120 },
  { tier: 3, xp: 540, reward: 180 },
  { tier: 4, xp: 860, reward: 240 },
  { tier: 5, xp: 1260, reward: 350 },
];

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
  privateRoom: null,
  tournament: null,
  lastReplay: null,
  campaignSummary: null,
  menuScreen: "home",
  timers: { spawn: null, clock: null, effect: null, toast: null, telemetry: null },
  audioCtx: null,
  bgmTimer: null,
  auth: loadAuthSession(),
  telemetry: loadTelemetryQueue(),
};

function loadProfile() {
  const fallback = {
    best: 0,
    coins: 0,
    unlocked: ["skin-classic", "crosshair-classic"],
    selected: { skin: "skin-classic", crosshair: "classic", trail: "✨", badge: "", weapon: "single" },
    skills: { combo_decay: 0, shield_cap: 0, clock_value: 0 },
    loadout: { perks: ["steady"], ability: "time_warp" },
    badges: [],
    streak: { count: 0, lastDay: "" },
    weeklyBest: {},
    friends: [],
    cloudId: "",
    tournamentClaims: {},
    battlePass: { xp: 0, claimed: [] },
    campaign: { mapIndex: 0, completed: [], stars: {}, gamesSinceBoss: 0, bossReady: false, bossesDefeated: 0, chapter: 1 },
    materials: { feather: 0, gear: 0, core: 0 },
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
      loadout: { ...fallback.loadout, ...(data.loadout || {}) },
      streak: { ...fallback.streak, ...(data.streak || {}) },
      battlePass: { ...fallback.battlePass, ...(data.battlePass || {}) },
      campaign: { ...fallback.campaign, ...(data.campaign || {}) },
      materials: { ...fallback.materials, ...(data.materials || {}) },
    };
  } catch {
    return fallback;
  }
}

function saveProfile() {
  localStorage.setItem(KEYS.profile, JSON.stringify(state.profile));
}

function loadSettings() {
  const fallback = { sound: true, haptics: true, socialEnabled: false, apiUrl: API_DEFAULT_URL, playMode: "freeplay" };
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

function loadAuthSession() {
  const fallback = { token: "", userId: "", username: "" };
  try {
    const raw = localStorage.getItem(KEYS.auth);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveAuthSession() {
  localStorage.setItem(KEYS.auth, JSON.stringify(state.auth));
}

function clearAuthSession() {
  state.auth = { token: "", userId: "", username: "" };
  saveAuthSession();
}

function loadTelemetryQueue() {
  try {
    const raw = localStorage.getItem(KEYS.telemetry);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.slice(-300) : [];
  } catch {
    return [];
  }
}

function saveTelemetryQueue() {
  localStorage.setItem(KEYS.telemetry, JSON.stringify(state.telemetry.slice(-300)));
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

function backendUrl() {
  const url = (state.settings.apiUrl || "").trim();
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function backendEnabled() {
  return Boolean(backendUrl());
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const base = backendUrl();
  if (!base) {
    throw new Error("Backend URL not configured");
  }

  const headers = { "Content-Type": "application/json" };
  if (auth && state.auth.token) {
    headers.Authorization = `Bearer ${state.auth.token}`;
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

function telemetryEvent(name, properties = {}) {
  const payload = {
    t: Date.now(),
    name,
    mode: state.mode,
    week: state.weekly ? state.weekly.week : "",
    user: state.auth.userId || state.profile.cloudId || "guest",
    properties,
  };
  state.telemetry.push(payload);
  state.telemetry = state.telemetry.slice(-300);
  saveTelemetryQueue();
}

async function flushTelemetry() {
  if (!backendEnabled() || state.telemetry.length === 0) return;
  const batch = state.telemetry.slice(0, 40);
  try {
    await apiRequest("/telemetry/batch", {
      method: "POST",
      auth: false,
      body: { game: "duck-v2", events: batch },
    });
    state.telemetry = state.telemetry.slice(batch.length);
    saveTelemetryQueue();
  } catch {
    // Keep queued for next attempt.
  }
}

async function authRegister(username, password) {
  if (!backendEnabled()) {
    throw new Error("Set API URL first");
  }
  const data = await apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: { username, password, game: "duck-v2" },
  });
  state.auth = {
    token: data?.token || "",
    userId: data?.userId || "",
    username: data?.username || username,
  };
  saveAuthSession();
  telemetryEvent("auth_register", { username: state.auth.username });
}

async function authLogin(username, password) {
  if (!backendEnabled()) {
    throw new Error("Set API URL first");
  }
  const data = await apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { username, password, game: "duck-v2" },
  });
  state.auth = {
    token: data?.token || "",
    userId: data?.userId || "",
    username: data?.username || username,
  };
  saveAuthSession();
  telemetryEvent("auth_login", { username: state.auth.username });
}

function authLogout() {
  clearAuthSession();
  telemetryEvent("auth_logout");
}

async function cloudPush() {
  if (!state.auth.token) throw new Error("Login required");
  await apiRequest("/cloud/profile", {
    method: "POST",
    body: {
      game: "duck-v2",
      profile: state.profile,
      missions: state.missions,
      leaderboard: state.localBoard.slice(0, 20),
      duel: state.duelTarget,
    },
  });
  telemetryEvent("cloud_push");
}

async function cloudPull() {
  if (!state.auth.token) throw new Error("Login required");
  const data = await apiRequest("/cloud/profile", { method: "GET" });
  if (data?.profile) state.profile = { ...loadProfile(), ...data.profile };
  if (data?.missions) state.missions = data.missions;
  if (Array.isArray(data?.leaderboard)) state.localBoard = data.leaderboard.slice(0, 30);
  if (data?.duel) state.duelTarget = data.duel;
  saveProfile();
  saveMissions();
  saveLocalLeaderboard();
  telemetryEvent("cloud_pull");
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

function getActiveTournament() {
  const daySeed = parseInt(hashStr(todayKey()).slice(0, 6), 16);
  const active = daySeed % 2 === 0; // Active every other day.
  if (!active) return null;
  return TOURNAMENTS[daySeed % TOURNAMENTS.length];
}

function getWeatherForRun(seed) {
  const idx = seed % WEATHER_PRESETS.length;
  return WEATHER_PRESETS[idx];
}

function battlePassTierFromXp(xp) {
  let tier = 0;
  for (const t of BATTLE_PASS_TIERS) {
    if (xp >= t.xp) tier = t.tier;
  }
  return tier;
}

function addBattlePassXp(xp) {
  state.profile.battlePass.xp += xp;
  saveProfile();
}

function claimBattlePassTier(tier) {
  const def = BATTLE_PASS_TIERS.find((x) => x.tier === tier);
  if (!def) return;
  if (state.profile.battlePass.xp < def.xp) return;
  if (state.profile.battlePass.claimed.includes(tier)) return;
  state.profile.battlePass.claimed.push(tier);
  state.profile.coins += def.reward;
  saveProfile();
  toast(`Battle Pass tier ${tier} claimed`);
  renderHud();
}

function exportCloudCode() {
  const payload = {
    v: 1,
    profile: state.profile,
    missions: state.missions,
    board: state.localBoard,
    duel: state.duelTarget,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function importCloudCode(code) {
  try {
    const raw = decodeURIComponent(escape(atob(code.trim())));
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object") throw new Error("invalid");
    if (payload.profile) state.profile = { ...loadProfile(), ...payload.profile };
    if (payload.missions) state.missions = payload.missions;
    if (Array.isArray(payload.board)) state.localBoard = payload.board.slice(0, 30);
    if (payload.duel) state.duelTarget = payload.duel;
    saveProfile();
    saveMissions();
    saveLocalLeaderboard();
    toast("Cloud sync imported");
    renderHud();
    renderMainMenu();
  } catch {
    toast("Invalid cloud code");
  }
}

function addFriend(name) {
  const clean = (name || "").trim().slice(0, 16);
  if (!clean) return;
  if (!state.profile.friends.includes(clean)) {
    state.profile.friends.push(clean);
    saveProfile();
    toast(`Friend added: ${clean}`);
  }
}

function createPrivateRoomCode() {
  const payload = {
    v: 1,
    host: state.profile.cloudId || "Host",
    seed: Date.now() & 0xffffffff,
    mode: state.mode,
    week: state.weekly.week,
  };
  return btoa(JSON.stringify(payload));
}

function joinPrivateRoom(code) {
  try {
    const payload = JSON.parse(atob(code.trim()));
    if (!payload || !Number.isFinite(payload.seed)) throw new Error("bad");
    state.privateRoom = payload;
    toast(`Joined room ${payload.host || "Host"}`);
  } catch {
    toast("Invalid room code");
  }
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

function activeCampaignChapter() {
  const chapterNumber = Math.max(1, state.profile.campaign.chapter || 1);
  const chapterIndex = (chapterNumber - 1) % CAMPAIGN_CHAPTERS.length;
  const cycle = Math.floor((chapterNumber - 1) / CAMPAIGN_CHAPTERS.length);
  const chapter = CAMPAIGN_CHAPTERS[chapterIndex];
  return { ...chapter, chapterNumber, chapterIndex, cycle };
}

function projectStateToMap(stateName) {
  const geo = STATE_GEO[stateName];
  if (!geo) return { x: 50, y: 34, state: stateName };
  const minLon = -125;
  const maxLon = -66;
  const minLat = 24;
  const maxLat = 50;
  const nx = (geo.lon - minLon) / (maxLon - minLon);
  const ny = (maxLat - geo.lat) / (maxLat - minLat);
  const offset = STATE_MAP_OFFSET[stateName] || { x: 0, y: 0 };
  const x = Math.max(8, Math.min(92, 8 + nx * 84 + offset.x));
  const y = Math.max(12, Math.min(56, 12 + ny * 44 + offset.y));
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), state: stateName };
}

function chapterNodesProjected(chapter) {
  return (chapter.nodes || []).map((name) => projectStateToMap(name));
}

function currentModeConfig() {
  const mode = MODES[state.mode];
  const campaignStep = Math.min(10, (state.profile.campaign.gamesSinceBoss || 0) + 1);
  const bossBattle = Boolean(state.profile.campaign.bossReady);
  const chapter = activeCampaignChapter();
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
  if (state.tournament) {
    cfg.scoreMult *= state.tournament.scoreMult;
    cfg.coinMult *= state.tournament.coinMult;
  }
  if (state.settings.playMode === "campaign") {
    const chapterPressure = chapter.chapterIndex * 0.03 + chapter.cycle * 0.05;
    if (bossBattle) {
      cfg.gameSeconds += 8;
      cfg.spawnMs = Math.max(cfg.minSpawnMs, cfg.spawnMs - 80);
      cfg.scoreMult *= 1.3 + chapterPressure;
      cfg.misses = Math.max(2, cfg.misses - 1);
    } else {
      cfg.spawnMs = Math.max(cfg.minSpawnMs, cfg.spawnMs - campaignStep * 35 - chapter.chapterIndex * 12 - chapter.cycle * 16);
      cfg.lifeMs = Math.max(1100, cfg.lifeMs - campaignStep * 70 - chapter.chapterIndex * 20 - chapter.cycle * 26);
      cfg.minusChance += campaignStep * 0.01 + chapter.chapterIndex * 0.006 + chapter.cycle * 0.008;
      cfg.scoreMult *= 1 + campaignStep * 0.04 + chapterPressure;
    }
  }
  for (const perk of state.profile.loadout.perks || []) {
    if (perk === "steady") cfg.comboGrace += 500;
    if (perk === "hunter") cfg.scoreMult *= 1.08;
    if (perk === "clocksmith") cfg.clockChance += 0.01;
  }
  return cfg;
}

function beginRun(seedOverride = null) {
  const config = currentModeConfig();
  const seed = seedOverride ?? (Date.now() & 0xffffffff);
  const rng = mulberry32(seed);
  const weather = getWeatherForRun(seed);
  config.spawnMs = Math.round(config.spawnMs * weather.spawnMult);
  config.minSpawnMs = Math.round(config.minSpawnMs * weather.spawnMult);
  config.lifeMs = Math.round(config.lifeMs * weather.lifeMult);
  config.clockChance = Math.max(0.01, config.clockChance + weather.clockBoost);

  const chosenWeapon = isWeaponOwned(state.profile.selected.weapon) ? state.profile.selected.weapon : "single";
  const campaignStep = Math.min(10, (state.profile.campaign.gamesSinceBoss || 0) + 1);
  const campaignBossBattle = state.settings.playMode === "campaign" && Boolean(state.profile.campaign.bossReady);
  const mapDef = campaignMap();
  const campaignNode = mapDef.label;
  state.profile.selected.weapon = chosenWeapon;
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
    replay: [],
    duelGhostScore: 0,
    weather,
    weapon: chosenWeapon,
    selectedAbility: state.profile.loadout.ability || "time_warp",
    abilityReadyAt: 0,
    abilityUses: 0,
    classStats: { armored: 0, teleport: 0, split: 0, decoy: 0 },
    materialsEarned: { feather: 0, gear: 0, core: 0 },
    map: mapDef,
    campaignStep,
    campaignBossBattle,
    campaignNode,
    gameOver: false,
  };
  gameArea.dataset.weather = weather.id;
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
    abilityBtn.disabled = true;
    abilityBtn.textContent = "Ability";
    return;
  }

  const fx = [];
  if (isFx("frenzy")) fx.push("FRENZY");
  if (isFx("slow")) fx.push("SLOW");
  fx.push(run.weather.label.toUpperCase());

  hud.score.textContent = String(run.score);
  hud.time.textContent = String(run.timeLeft);
  hud.misses.textContent = `${run.misses}/${run.config.misses}`;
  hud.combo.textContent = `x${comboMult()}`;
  hud.level.textContent = String(run.level);
  hud.effects.textContent = fx.length ? fx.join("+") : "None";

  const ability = HERO_ABILITIES[run.selectedAbility] || HERO_ABILITIES.time_warp;
  const cdLeft = Math.max(0, Math.ceil((run.abilityReadyAt - Date.now()) / 1000));
  abilityBtn.disabled = !state.running || state.paused || run.gameOver || cdLeft > 0;
  abilityBtn.textContent = cdLeft > 0 ? `${ability.label} ${cdLeft}s` : ability.label;
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

function playModeButtons() {
  const modes = [
    { id: "freeplay", label: "Free Play" },
    { id: "campaign", label: "Campaign" },
  ];
  return modes
    .map((m) => `<button class="mini-btn ${state.settings.playMode === m.id ? "active" : ""}" data-playmode="${m.id}">${m.label}</button>`)
    .join("");
}

function tournamentMarkup() {
  if (!state.tournament) {
    return `<p class="leaderboard-empty">No active tournament today.</p>`;
  }
  const claimed = state.profile.tournamentClaims[state.tournament.id] === todayKey();
  return `
    <div class="menu-row"><span>Active</span><strong>${state.tournament.label}</strong></div>
    <div class="menu-row"><span>Target</span><span>${state.tournament.target} score</span></div>
    <div class="menu-row"><span>Reward</span><span>${state.tournament.reward} coins</span></div>
    <div class="menu-row"><span>Status</span><span>${claimed ? "Claimed today" : "Available"}</span></div>
  `;
}

function battlePassMarkup() {
  const xp = state.profile.battlePass.xp;
  const tier = battlePassTierFromXp(xp);
  const rows = BATTLE_PASS_TIERS.map((t) => {
    const claimed = state.profile.battlePass.claimed.includes(t.tier);
    const unlocked = xp >= t.xp;
    const action = claimed
      ? `<button class="mini-btn active" disabled>Claimed</button>`
      : unlocked
      ? `<button class="mini-btn active" data-claim-pass="${t.tier}">Claim ${t.reward}</button>`
      : `<span>${xp}/${t.xp} XP</span>`;
    return `<li><span>Tier ${t.tier}</span>${action}</li>`;
  }).join("");

  return `
    <div class="menu-row"><span>Pass XP</span><strong>${xp}</strong></div>
    <div class="menu-row"><span>Current Tier</span><strong>${tier}</strong></div>
    <ul class="menu-list">${rows}</ul>
  `;
}

function campaignMap() {
  const chapter = activeCampaignChapter();
  const nodes = chapterNodesProjected(chapter);
  const idx = Math.min(nodes.length - 1, state.profile.campaign.gamesSinceBoss || 0);
  const node = nodes[idx];
  const difficultyTier = chapter.chapterIndex + chapter.cycle * CAMPAIGN_CHAPTERS.length;
  return {
    id: `${chapter.id}-${idx + 1}`,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    chapterTheme: chapter.theme,
    label: node?.state || "Unknown",
    step: idx + 1,
    targetScore: 420 + idx * 65 + difficultyTier * 30,
    bossGoal: 0,
  };
}

function perkButtons() {
  const selected = state.profile.loadout.perks || [];
  return Object.entries(PERKS)
    .map(([id, p]) => `<button class="mini-btn ${selected.includes(id) ? "active" : ""}" data-perk="${id}" title="${escapeHtml(p.desc)}">${p.label}</button>`)
    .join("");
}

function abilityButtons() {
  const current = state.profile.loadout.ability || "time_warp";
  return Object.entries(HERO_ABILITIES)
    .map(([id, a]) => `<button class="mini-btn ${current === id ? "active" : ""}" data-ability="${id}" title="${escapeHtml(a.desc)}">${a.label}</button>`)
    .join("");
}

function materialsMarkup() {
  const m = state.profile.materials;
  return `<div class="menu-row"><span>Materials</span><span>🪶 ${m.feather} | ⚙️ ${m.gear} | 🔷 ${m.core}</span></div>`;
}

function craftingMarkup() {
  const rows = Object.entries(RECIPES).map(([id, r]) => {
    const cost = Object.entries(r.cost).map(([k, v]) => `${k}:${v}`).join(" ");
    return `<li><span>${r.label} <small>${cost}</small></span><button class="mini-btn" data-craft="${id}">Craft</button></li>`;
  }).join("");
  return `<ul class="menu-list">${rows}</ul>`;
}

function campaignMarkup() {
  const map = campaignMap();
  const gamesSinceBoss = state.profile.campaign.gamesSinceBoss || 0;
  const bossReady = Boolean(state.profile.campaign.bossReady);
  return `
    <div class="menu-row"><span>Chapter</span><strong>${state.profile.campaign.chapter || 1} - ${map.chapterTitle}</strong></div>
    <div class="menu-row"><span>Theme</span><span>${map.chapterTheme}</span></div>
    <div class="menu-row"><span>Route Step</span><span>${map.step}/10 - ${map.label}</span></div>
    <div class="menu-row"><span>Boss Battle</span><span>${bossReady ? "Ready now" : `${10 - gamesSinceBoss} games left`}</span></div>
  `;
}

function campaignMapCardMarkup() {
  const chapter = activeCampaignChapter();
  const nodesDef = chapterNodesProjected(chapter);
  const gamesSinceBoss = state.profile.campaign.gamesSinceBoss || 0;
  const bossReady = Boolean(state.profile.campaign.bossReady);
  const completed = bossReady ? 10 : Math.min(10, gamesSinceBoss);
  const activeIndex = bossReady ? 9 : Math.min(nodesDef.length - 1, gamesSinceBoss);
  const routeLine = nodesDef.map((p) => `${p.x},${p.y}`).join(" ");

  const nodes = nodesDef.map((p, idx) => {
    let cls = "campaign-node";
    if (idx < completed) cls += " done";
    if (idx === activeIndex) cls += " active";
    if (bossReady && idx === nodesDef.length - 1) cls += " boss";
    const label = p.state || `Step ${idx + 1}`;
    return `
      <g class="${cls}" transform="translate(${p.x} ${p.y})">
        <circle r="2.8"></circle>
        <text y="-4.3">${idx + 1}</text>
        <title>Level ${idx + 1}: ${label}</title>
      </g>
    `;
  }).join("");

  return `
    <div class="campaign-map-card" aria-label="Campaign map of America">
      <svg viewBox="0 0 100 64" role="img" aria-label="United States campaign route map">
        <path class="usa-shape" d="M7 46 L10 42 L13 42 L15 35 L20 34 L23 30 L28 30 L31 33 L35 32 L39 36 L46 35 L50 38 L55 38 L60 36 L64 39 L69 40 L73 38 L79 39 L83 36 L89 38 L92 35 L94 38 L92 44 L89 48 L84 49 L80 53 L72 55 L66 53 L61 56 L55 55 L48 56 L42 54 L36 55 L29 54 L24 51 L17 52 L12 50 Z"></path>
        <polyline class="campaign-route-line" points="${routeLine}"></polyline>
        ${nodes}
      </svg>
    </div>
  `;
}

function renderCampaignMapMenu() {
  const chapter = activeCampaignChapter();
  const map = campaignMap();
  const gamesSinceBoss = state.profile.campaign.gamesSinceBoss || 0;
  const bossReady = Boolean(state.profile.campaign.bossReady);
  const summary = state.campaignSummary;
  const replayBtn = state.lastReplay ? `<button class="mini-btn" data-open-replay="1">View Replay</button>` : "";

  state.menuScreen = "campaign-map";
  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Campaign Map - Chapter ${chapter.chapterNumber}</h1>
    <p>${chapter.title}: ${chapter.theme}</p>
    ${campaignMapCardMarkup()}
    <div class="menu-row"><span>Map</span><span>${chapter.title}</span></div>
    <div class="menu-row"><span>Current Level</span><span>${bossReady ? "Boss Battle" : `Step ${map.step}/10 - ${map.label}`}</span></div>
    <div class="menu-row"><span>Progress</span><span>${bossReady ? "10/10 complete - boss unlocked" : `${gamesSinceBoss}/10 cleared`}</span></div>
    ${summary ? `
      <h2>Last Result</h2>
      <div class="menu-row"><span>Outcome</span><strong>${escapeHtml(summary.reason)}</strong></div>
      <div class="menu-row"><span>Score</span><span>${summary.score} | Accuracy ${summary.accuracy}%</span></div>
      <div class="menu-row"><span>Run Rewards</span><span>+${summary.coins} coins | +🪶${summary.materials.feather} +⚙️${summary.materials.gear} +🔷${summary.materials.core}</span></div>
      <div class="save-score">
        <input id="playerName" maxlength="12" placeholder="Your name" />
        <button id="saveScoreBtn" type="button">Save</button>
      </div>
      <div class="menu-row"><span>Shop</span><button class="mini-btn active" data-open-shop="1">Go to Shop</button></div>
      ${replayBtn ? `<div class="menu-row"><span>Replay</span>${replayBtn}</div>` : ""}
      <p class="save-status" id="saveStatus"></p>
    ` : ""}
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">${bossReady ? "Start Boss Battle" : `Play Level ${map.step}`}</button>
  `;
}

function friendsMarkup() {
  const friends = state.profile.friends.slice(0, 6);
  if (!friends.length) return `<p class="leaderboard-empty">No friends yet.</p>`;
  return `<ul class="menu-list">${friends.map((f) => `<li><span>${escapeHtml(f)}</span><span>Friend</span></li>`).join("")}</ul>`;
}

function weaponShopMarkup() {
  const rows = WEAPON_SHOP.map((weapon) => {
    const unlockId = `weapon-${weapon.id}`;
    const owned = state.profile.unlocked.includes(unlockId) || weapon.id === "single";
    const selected = (state.profile.selected.weapon || "single") === weapon.id;
    const button = owned
      ? `<button class="mini-btn ${selected ? "active" : ""}" data-select-weapon="${weapon.id}">${selected ? "Selected" : "Use"}</button>`
      : `<button class="mini-btn" data-buy-weapon="${weapon.id}">Buy ${weapon.cost}</button>`;
    return `<li><span>${weapon.label} <small>${weapon.note}</small></span>${button}</li>`;
  }).join("");
  return `<ul class="menu-list">${rows}</ul>`;
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
  const hasReplay = Boolean(state.lastReplay);
  const duel = state.duelTarget ? `
    <div class="menu-row"><span>Duel</span><span>${escapeHtml(state.duelTarget.name)} (${state.duelTarget.score})</span></div>
  ` : "";

  state.menuScreen = "home";
  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Duck Hunt Next Level</h1>
    <p>${event.label}: ${event.note}</p>
    <div class="menu-row"><span>Mode</span><div class="mini-group">${modeButtons()}</div></div>
    <div class="menu-row"><span>Play Style</span><div class="mini-group">${playModeButtons()}</div></div>
    <div class="menu-row"><span>Sound</span><button class="mini-btn ${state.settings.sound ? "active" : ""}" data-toggle="sound">${state.settings.sound ? "On" : "Off"}</button></div>
    <div class="menu-row"><span>Haptics</span><button class="mini-btn ${state.settings.haptics ? "active" : ""}" data-toggle="haptics">${state.settings.haptics ? "On" : "Off"}</button></div>
    ${duel}
    <h2>Tournament</h2>
    ${tournamentMarkup()}
    <h2>Campaign</h2>
    ${campaignMarkup()}
    <div class="menu-row"><span>Campaign Map</span><button class="mini-btn active" data-open-campaign-map="1">Open Map</button></div>
    <div class="menu-row"><span>Progress</span><button class="mini-btn active" data-open-progress="1">Missions & Pass</button></div>
    <div class="menu-row"><span>Economy + Shop</span><button class="mini-btn active" data-open-shop="1">Open Shop</button></div>
    <div class="menu-row"><span>Social Features</span><button class="mini-btn ${state.settings.socialEnabled ? "active" : ""}" data-toggle-social="1">${state.settings.socialEnabled ? "Enabled" : "Optional"}</button></div>
    ${state.settings.socialEnabled ? `<div class="menu-row"><span>Friends & Rooms</span><button class="mini-btn active" data-open-social="1">Open Social</button></div>` : ""}
    ${hasReplay ? `<div class="menu-row"><span>Replay</span><button class="mini-btn active" data-open-replay="1">View Last Replay</button></div>` : ""}
    <h2>Leaderboard (Local)</h2>
    ${boardMarkup(state.localBoard)}
    <h2>Leaderboard (Online)</h2>
    ${boardMarkup(state.onlineBoard)}
    <div class="menu-row"><input id="duelCodeInput" class="menu-input" placeholder="Paste duel code" /><button class="mini-btn" data-import-duel="1">Load Duel</button></div>
    <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
  `;
}

function renderProgressMenu() {
  state.menuScreen = "progress";
  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Progress</h1>
    <h2>Campaign</h2>
    ${campaignMarkup()}
    <h2>Loadout</h2>
    <div class="menu-row"><span>Perks (max 2)</span><div class="mini-group">${perkButtons()}</div></div>
    <div class="menu-row"><span>Hero Ability</span><div class="mini-group">${abilityButtons()}</div></div>
    <h2>Daily Missions</h2>
    <ul class="menu-list">${missionMarkup()}</ul>
    <h2>Battle Pass</h2>
    ${battlePassMarkup()}
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
  `;
}

function renderShopMenu() {
  state.menuScreen = "shop";
  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Shop & Economy</h1>
    <div class="menu-row"><span>Total Coins</span><strong>${state.profile.coins}</strong></div>
    ${materialsMarkup()}
    <h2>Skill Tree Upgrades</h2>
    ${skillMarkup()}
    <h2>Weapon Upgrades</h2>
    ${weaponShopMarkup()}
    <h2>Cosmetics & Unlocks</h2>
    ${shopMarkup()}
    <h2>Crafting</h2>
    ${craftingMarkup()}
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
  `;
}

function renderSocialMenu() {
  state.menuScreen = "social";
  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  if (!state.settings.socialEnabled) {
    messageEl.innerHTML = `
      <h1>Social (Optional)</h1>
      <p>Enable social features to use Friends and Private Rooms.</p>
      <div class="menu-row"><span>Status</span><button class="mini-btn" data-toggle-social="1">Enable Social</button></div>
      <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
      <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
    `;
    return;
  }

  messageEl.innerHTML = `
    <h1>Social Hub</h1>
    ${friendsMarkup()}
    <div class="menu-row"><input id="friendInput" class="menu-input" placeholder="Friend name" /><button class="mini-btn" data-add-friend="1">Add Friend</button></div>
    <h2>Private Rooms</h2>
    <div class="menu-row"><span>Create Room</span><button class="mini-btn" data-room-create="1">Copy Code</button></div>
    <div class="menu-row"><input id="roomCodeInput" class="menu-input" placeholder="Room code" /><button class="mini-btn" data-room-join="1">Join Room</button></div>
    <h2>Backend Cloud/Auth</h2>
    <div class="menu-row"><input id="apiUrlInput" class="menu-input" placeholder="API URL (https://...)" value="${escapeHtml(state.settings.apiUrl || "")}" /><button class="mini-btn" data-api-save="1">Save URL</button></div>
    <div class="menu-row"><input id="authUserInput" class="menu-input" placeholder="Username" value="${escapeHtml(state.auth.username || "")}" /><button class="mini-btn" data-auth-login="1">Login</button></div>
    <div class="menu-row"><input id="authPassInput" class="menu-input" placeholder="Password" type="password" /><button class="mini-btn" data-auth-register="1">Register</button></div>
    <div class="menu-row"><span>Session</span><span>${state.auth.token ? `Logged in (${escapeHtml(state.auth.username || "user")})` : "Guest"}</span></div>
    <div class="menu-row"><span>Cloud Sync</span><div class="mini-group"><button class="mini-btn" data-cloud-pull="1">Pull</button><button class="mini-btn" data-cloud-push="1">Push</button><button class="mini-btn" data-auth-logout="1">Logout</button></div></div>
    <h2>Offline Backup</h2>
    <div class="menu-row"><input id="cloudIdInput" class="menu-input" placeholder="Cloud ID" value="${escapeHtml(state.profile.cloudId || "")}" /><button class="mini-btn" data-cloud-login="1">Set</button></div>
    <div class="menu-row"><input id="cloudCodeInput" class="menu-input" placeholder="Cloud backup code" /><button class="mini-btn" data-cloud-import="1">Import</button></div>
    <div class="menu-row"><span>Backup</span><button class="mini-btn" data-cloud-export="1">Export Code</button></div>
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
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
    <p>Materials +🪶${run.materialsEarned.feather} +⚙️${run.materialsEarned.gear} +🔷${run.materialsEarned.core}</p>
    <p>Accuracy <strong>${acc}%</strong> | Bosses <strong>${run.bossesDown}</strong></p>
    <div class="save-score">
      <input id="playerName" maxlength="12" placeholder="Your name" />
      <button id="saveScoreBtn" type="button">Save</button>
    </div>
    <div class="menu-row"><input id="challengeCode" class="menu-input" value="${challenge}" readonly /><button class="mini-btn" data-copy="challenge">Copy Code</button></div>
    <button class="mini-btn active" data-open-shop="1">Go to Shop</button>
    <button class="mini-btn" data-open-replay="1">View Replay</button>
    <p class="save-status" id="saveStatus"></p>
    <button id="startBtn" type="button">Play Again</button>
  `;
}

function renderReplayMenu() {
  if (!state.lastReplay) {
    toast("No replay available");
    return;
  }
  const events = state.lastReplay.events
    .slice(0, 18)
    .map((e) => `<li><span>${e.t}s</span><span>${escapeHtml(e.msg)}</span></li>`)
    .join("");

  gameArea.dataset.weather = "clear";
  messageEl.hidden = false;
  messageEl.innerHTML = `
    <h1>Replay Viewer</h1>
    <div class="menu-row"><span>Score</span><strong>${state.lastReplay.score}</strong></div>
    <div class="menu-row"><span>Seed</span><span>${state.lastReplay.seed}</span></div>
    <div class="menu-row"><span>Mode</span><span>${state.lastReplay.mode}</span></div>
    <div class="menu-row"><span>Weather</span><span>${state.lastReplay.weather}</span></div>
    <h2>Key Moments</h2>
    <ul class="menu-list">${events || "<li><span>No key moments</span><span>-</span></li>"}</ul>
    <div class="menu-row"><span>Back</span><button class="mini-btn active" data-open-home="1">Main Menu</button></div>
    <button id="startBtn" type="button">${state.settings.playMode === "campaign" ? "Start Campaign" : "Start Free Play"}</button>
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

function replayEvent(msg) {
  if (!state.run) return;
  const elapsed = state.run.config.gameSeconds - state.run.timeLeft;
  state.run.replay.push({ t: Math.max(0, elapsed), msg });
  if (state.run.replay.length > 60) state.run.replay.shift();
}

function applyWeaponBonusOnHit(type) {
  const weapon = state.run.weapon;
  if (weapon === "pierce" && type === "duck") {
    state.run.score += 8;
    replayEvent("Pierce bonus");
  } else if (weapon === "spread" && type === "duck" && state.run.rng() < 0.25) {
    state.run.score += 6;
    state.run.coinsEarned += 1;
    replayEvent("Spread splash");
  } else if (weapon === "burst" && type === "duck") {
    state.run.score += 4;
    state.run.coinsEarned += 1;
    replayEvent("Burst extra hit");
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

function chooseDuckClass() {
  const r = state.run.rng();
  if (r < 0.1) return "armored";
  if (r < 0.18) return "teleport";
  if (r < 0.25) return "split";
  if (r < 0.32) return "decoy";
  return "basic";
}

function rewardMaterials(feather = 0, gear = 0, core = 0) {
  state.run.materialsEarned.feather += feather;
  state.run.materialsEarned.gear += gear;
  state.run.materialsEarned.core += core;
}

function spawnMiniTarget(x, y) {
  const target = document.createElement("button");
  target.className = "target duck mini";
  target.type = "button";
  target.textContent = selectedSkinEmoji();
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.width = "38px";
  target.style.height = "38px";
  target.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!state.running || state.paused || state.run.gameOver) return;
    state.run.shots += 1;
    state.run.hits += 1;
    state.run.score += 8;
    state.run.coinsEarned += 2;
    rewardMaterials(1, 0, 0);
    particle(event.clientX - gameArea.getBoundingClientRect().left, event.clientY - gameArea.getBoundingClientRect().top, "✨");
    target.remove();
    renderHud();
  });
  gameArea.appendChild(target);
  setTimeout(() => {
    if (target.isConnected) target.remove();
  }, 1200);
}

function bossMaybe() {
  if (state.run.campaignBossBattle) {
    if (!state.run.boss && state.run.bossesDown === 0) {
      spawnTarget("boss");
    }
    return;
  }
  if (state.run.boss || state.run.level % BASE.bossEveryLevels !== 0) return;
  if (state.run.level === 0) return;
  spawnTarget("boss");
}

function spawnTarget(forceType = null) {
  if (!state.running || state.paused || state.run.gameOver) return;

  const type = forceType || spawnType();
  const duckClass = type === "duck" ? chooseDuckClass() : null;
  const symbols = {
    duck: selectedSkinEmoji(),
    minus: "🦆",
    clock: "⏰",
    shield: "🛡️",
    slow: "❄️",
    boss: "🦅",
  };

  const target = document.createElement("button");
  target.className = `target ${type}${duckClass ? ` ${duckClass}` : ""}`;
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
  const weatherDriftBoost = state.run.weather.id === "windy" ? 1.35 : state.run.weather.id === "storm" ? 1.5 : 1;
  const lifeMs = boss ? state.run.config.lifeMs + 1800 : (small ? state.run.config.lifeMs - 650 : state.run.config.lifeMs);

  target.animate([
    { transform: "translate(0, 0)" },
    { transform: `translate(${(driftX * weatherDriftBoost).toFixed(2)}px, -14px)` },
    { transform: "translate(0, -24px)" },
  ], { duration: lifeMs, easing: "ease-out", fill: "forwards" });

  let hp = boss ? 8 + Math.floor(state.run.level / 2) : duckClass ? DUCK_CLASSES[duckClass].hp : 1;
  let teleported = false;
  if (boss) {
    const patterns = ["zigzag", "shielded", "rage"];
    const pattern = patterns[state.run.level % patterns.length];
    state.run.boss = { hp, max: hp, pattern, shieldStep: false };
    replayEvent(`Boss spawn (${pattern})`);
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
      if (state.run.boss.pattern === "shielded" && !state.run.boss.shieldStep) {
        state.run.boss.shieldStep = true;
        toast("Boss shield blocked hit");
        replayEvent("Boss shield block");
        return;
      }
      state.run.boss.shieldStep = false;
      hp -= 1;
      particle(tx, ty, "⚡");
      tone(280 + hp * 22, 70, "square", 0.05);
      vibrate(12);
      if (state.run.boss.pattern === "zigzag" && hp > 0) {
        const shift = (state.run.rng() * 80 - 40).toFixed(1);
        target.animate(
          [{ transform: "translate(0,0)" }, { transform: `translate(${shift}px, -18px)` }],
          { duration: 220, easing: "ease-out", fill: "forwards" }
        );
      }
      if (state.run.boss.pattern === "rage") {
        state.run.spawnDelay = Math.max(state.run.config.minSpawnMs, state.run.spawnDelay - 18);
        restartSpawner();
      }
      if (hp > 0) {
        toast(`Boss HP ${hp}`);
        return;
      }
      hit = true;
      state.run.boss = null;
      state.run.bossesDown += 1;
      state.run.score += 180 * state.run.config.scoreMult;
      state.run.coinsEarned += 45;
      replayEvent("Boss defeated");
      missionProgress("boss", state.run.bossesDown);
      badgeUnlock("boss-slayer");
      toast("Boss defeated");
      tone(780, 140, "triangle", 0.06);
      if (state.run.campaignBossBattle) {
        finishRun("Campaign boss defeated");
        return;
      }
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
      replayEvent("Clock pickup");
      particle(tx, ty, "✨");
      toast(`+${state.run.config.clockSeconds}s`);
      tone(620, 120, "triangle", 0.05);
      vibrate(16);
    } else if (type === "shield") {
      hit = true;
      state.run.shields = Math.min(state.run.config.maxShields, state.run.shields + 1);
      state.run.score += 8;
      state.run.coinsEarned += 3;
      replayEvent("Shield pickup");
      particle(tx, ty, "🛡️");
      toast("Shield +1");
      tone(500, 100, "sine", 0.05);
    } else if (type === "slow") {
      hit = true;
      setFx("slow", 5000);
      state.run.score += 10;
      state.run.coinsEarned += 4;
      replayEvent("Slowmo pickup");
      particle(tx, ty, "❄️");
      toast("Slow motion");
      tone(360, 120, "sine", 0.05);
    } else {
      if (duckClass === "armored" && hp > 1) {
        hp -= 1;
        state.run.classStats.armored += 1;
        toast("Armored hit");
        replayEvent("Armored shell");
        tone(260, 80, "square", 0.04);
        return;
      }
      if (duckClass === "teleport" && !teleported) {
        teleported = true;
        state.run.classStats.teleport += 1;
        target.style.left = `${(state.run.rng() * (rect.width - size - 8) + 4).toFixed(1)}px`;
        target.style.top = `${(state.run.rng() * (rect.height * 0.62 - size - 16) + 16).toFixed(1)}px`;
        toast("Teleport duck");
        replayEvent("Teleport evade");
        return;
      }
      hit = true;
      state.run.combo += 1;
      state.run.comboStreak = Math.max(state.run.comboStreak, state.run.combo);
      const frenzyMult = isFx("frenzy") ? 2 : 1;
      const weaponMult = WEAPONS[state.run.weapon]?.scoreMult || 1;
      const pts = Math.round(BASE.normalPoints * comboMult() * frenzyMult * state.run.config.scoreMult * weaponMult);
      state.run.score += pts;
      state.run.coinsEarned += Math.max(1, Math.round((1 + comboMult() / 2) * state.run.config.coinMult));
      applyWeaponBonusOnHit(type);
      rewardMaterials(1, duckClass === "armored" ? 1 : 0, 0);
      if (duckClass === "split") {
        state.run.classStats.split += 1;
        spawnMiniTarget(Math.max(6, tx - 20), Math.max(6, ty - 20));
        replayEvent("Split duck");
      }
      if (duckClass === "decoy") {
        state.run.classStats.decoy += 1;
        state.run.score = Math.max(0, state.run.score - 6);
        toast("Decoy");
        replayEvent("Decoy hit");
      }
      if (state.run.combo > 0 && state.run.combo % 6 === 0) {
        state.run.timeLeft += 2;
        state.run.score += 15;
        toast("Streak bonus +2s");
        replayEvent("Streak bonus");
      }
      if (state.run.combo === 10) {
        setFx("frenzy", 6000);
        toast("Frenzy");
        replayEvent("Frenzy start");
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
      replayEvent("Boss escaped");
      if (state.run.campaignBossBattle) {
        finishRun("Campaign boss escaped");
      }
      return;
    }

    if (type === "minus") {
      target.remove();
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
  try {
    if (backendEnabled()) {
      const data = await apiRequest("/scores/top?game=duck-v2", { auth: false });
      state.onlineBoard = Array.isArray(data) ? data.slice(0, 10) : [];
      return;
    }
    if (ONLINE_LEADERBOARD_URL) {
      const res = await fetch(`${ONLINE_LEADERBOARD_URL}/top?game=duck-v2`, { method: "GET" });
      const data = await res.json();
      state.onlineBoard = Array.isArray(data) ? data.slice(0, 10) : [];
      return;
    }
    state.onlineBoard = [];
  } catch {
    state.onlineBoard = [];
  }
}

async function submitOnlineScore(name) {
  if (!validateRunBeforeSubmit()) return;
  const payload = {
    game: "duck-v2",
    name,
    score: state.run.score,
    mode: state.mode,
    week: state.weekly.week,
    proof: runProof(),
    seed: state.run.seed,
  };
  try {
    if (backendEnabled()) {
      const result = await apiRequest("/scores/submit", { method: "POST", body: payload });
      telemetryEvent("score_submit_verified", { verified: Boolean(result?.verified), score: state.run.score });
      return;
    }
    if (ONLINE_LEADERBOARD_URL) {
      await fetch(`${ONLINE_LEADERBOARD_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      telemetryEvent("score_submit_legacy", { score: state.run.score });
    }
  } catch {
    telemetryEvent("score_submit_failed", { score: state.run.score });
  }
}

function restartSpawner() {
  if (state.timers.spawn) clearInterval(state.timers.spawn);
  let delay = state.run.spawnDelay;
  if (isFx("slow")) delay = Math.round(delay * 1.45);
  if (state.run.campaignBossBattle) {
    state.timers.spawn = setInterval(() => {
      if (!state.running || state.paused || state.run.gameOver) return;
      if (!state.run.boss && state.run.bossesDown === 0) {
        spawnTarget("boss");
      }
    }, 900);
    return;
  }
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

function evaluateCampaignRun() {
  if (state.settings.playMode !== "campaign") return;

  if (state.run.campaignBossBattle) {
    if (state.run.bossesDown >= 1) {
      state.profile.campaign.bossesDefeated += 1;
      state.profile.campaign.chapter += 1;
      state.profile.campaign.gamesSinceBoss = 0;
      state.profile.campaign.bossReady = false;
      state.profile.coins += 200;
      toast("Campaign chapter cleared");
      telemetryEvent("campaign_boss_clear", { chapter: state.profile.campaign.chapter });
    } else {
      state.profile.campaign.bossReady = true;
      toast("Boss battle failed");
      telemetryEvent("campaign_boss_fail", { chapter: state.profile.campaign.chapter });
    }
    return;
  }

  state.profile.campaign.gamesSinceBoss = Math.min(10, (state.profile.campaign.gamesSinceBoss || 0) + 1);
  if (state.profile.campaign.gamesSinceBoss >= 10) {
    state.profile.campaign.bossReady = true;
    toast("Boss battle unlocked");
    telemetryEvent("campaign_boss_ready", { chapter: state.profile.campaign.chapter });
  }
}

function startRun(seed = null) {
  beginRun(seed);
  state.campaignSummary = null;
  state.running = true;
  state.paused = false;

  messageEl.hidden = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  pauseBtn.textContent = "Pause";

  if (state.run.campaignBossBattle) {
    spawnTarget("boss");
  } else {
    spawnTarget();
  }
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
  telemetryEvent("run_start", {
    seed: state.run.seed,
    mode: state.mode,
    playMode: state.settings.playMode,
    campaignStep: state.run.campaignStep,
    campaignBossBattle: state.run.campaignBossBattle,
    weather: state.run.weather.id,
    weapon: state.run.weapon,
  });
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
  state.profile.materials.feather += state.run.materialsEarned.feather;
  state.profile.materials.gear += state.run.materialsEarned.gear;
  state.profile.materials.core += state.run.materialsEarned.core;
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

  evaluateCampaignRun();

  const passXp = Math.max(20, Math.round(state.run.score / 8) + state.run.bossesDown * 12);
  addBattlePassXp(passXp);

  if (state.tournament && state.run.score >= state.tournament.target) {
    const claimedToday = state.profile.tournamentClaims[state.tournament.id] === todayKey();
    if (!claimedToday) {
      state.profile.coins += state.tournament.reward;
      state.profile.tournamentClaims[state.tournament.id] = todayKey();
      toast(`Tournament reward +${state.tournament.reward} coins`);
      badgeUnlock("tournament-winner");
    }
  }

  state.lastReplay = {
    seed: state.run.seed,
    score: state.run.score,
    mode: state.mode,
    playMode: state.settings.playMode,
    weather: state.run.weather.label,
    ability: state.run.selectedAbility,
    events: state.run.replay.slice(-30),
  };

  saveProfile();
  renderHud();
  const accuracy = state.run.shots ? Math.round((state.run.hits / state.run.shots) * 100) : 0;
  telemetryEvent("run_end", {
    reason,
    score: state.run.score,
    hits: state.run.hits,
    misses: state.run.misses,
    timeLeft: state.run.timeLeft,
    playMode: state.settings.playMode,
    campaignStep: state.run.campaignStep,
    campaignBossBattle: state.run.campaignBossBattle,
  });
  flushTelemetry();
  if (state.settings.playMode === "campaign") {
    state.campaignSummary = {
      reason,
      score: state.run.score,
      accuracy,
      coins: state.run.coinsEarned,
      materials: { ...state.run.materialsEarned },
    };
    renderCampaignMapMenu();
    return;
  }
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
  telemetryEvent("score_saved_local", { score: state.run.score, name: n });

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
  if (state.settings.playMode === "campaign") {
    startRun();
    return;
  }
  if (state.settings.socialEnabled && state.privateRoom) {
    if (MODES[state.privateRoom.mode]) state.mode = state.privateRoom.mode;
    startRun(state.privateRoom.seed >>> 0);
    toast(`Room: ${state.privateRoom.host || "Host"}`);
    return;
  }
  if (state.duelTarget && Number.isFinite(state.duelTarget.seed)) {
    startRun(state.duelTarget.seed >>> 0);
  } else {
    startRun();
  }
}

function canAfford(cost) {
  return state.profile.coins >= cost;
}

function togglePerk(perkId) {
  if (!PERKS[perkId]) return;
  const perks = state.profile.loadout.perks || [];
  const idx = perks.indexOf(perkId);
  if (idx >= 0) {
    perks.splice(idx, 1);
  } else if (perks.length < 2) {
    perks.push(perkId);
  } else {
    toast("Max 2 perks");
  }
  state.profile.loadout.perks = perks;
  saveProfile();
}

function setAbility(abilityId) {
  if (!HERO_ABILITIES[abilityId]) return;
  state.profile.loadout.ability = abilityId;
  saveProfile();
}

function canCraft(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;
  return Object.entries(recipe.cost).every(([k, v]) => (state.profile.materials[k] || 0) >= v);
}

function craftRecipe(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return;
  if (!canCraft(recipeId)) {
    toast("Not enough materials");
    return;
  }
  for (const [k, v] of Object.entries(recipe.cost)) {
    state.profile.materials[k] -= v;
  }
  for (const [k, v] of Object.entries(recipe.reward)) {
    if (k === "coins") state.profile.coins += v;
    else state.profile.materials[k] = (state.profile.materials[k] || 0) + v;
  }
  saveProfile();
  renderHud();
  toast(`Crafted ${recipe.label}`);
  renderShopMenu();
}

function isWeaponOwned(weaponId) {
  return weaponId === "single" || state.profile.unlocked.includes(`weapon-${weaponId}`);
}

function buyWeapon(weaponId) {
  const def = WEAPON_SHOP.find((w) => w.id === weaponId);
  if (!def) return;
  if (isWeaponOwned(weaponId)) return;
  if (!canAfford(def.cost)) {
    toast("Not enough coins");
    return;
  }
  state.profile.coins -= def.cost;
  state.profile.unlocked.push(`weapon-${weaponId}`);
  saveProfile();
  renderHud();
  telemetryEvent("buy_weapon", { weaponId, cost: def.cost });
  toast(`Unlocked ${def.label}`);
  renderShopMenu();
}

function selectWeapon(weaponId) {
  if (!WEAPONS[weaponId]) return;
  if (!isWeaponOwned(weaponId)) return;
  state.profile.selected.weapon = weaponId;
  saveProfile();
  telemetryEvent("select_weapon", { weaponId });
  toast(`Weapon: ${WEAPONS[weaponId].label}`);
  renderShopMenu();
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
  telemetryEvent("buy_item", { id, cost: item.cost });
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
  telemetryEvent("upgrade_skill", { id, level: state.profile.skills[id] });
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
  const jitter = state.run.weather.id === "storm" ? (state.run.rng() * 10 - 5) : 0;
  crosshair.style.left = `${x + jitter}px`;
  crosshair.style.top = `${y + jitter}px`;
  crosshair.classList.remove("show");
  void crosshair.offsetWidth;
  crosshair.classList.add("show");

  const target = event.target.closest(".target");
  if (!target) {
    state.run.shots += 1;
    missPenalty(1);
  }
}

function useAbility() {
  if (!state.running || state.paused || !state.run || state.run.gameOver) return;
  if (Date.now() < state.run.abilityReadyAt) return;
  const ability = HERO_ABILITIES[state.run.selectedAbility];
  if (!ability) return;

  if (state.run.selectedAbility === "time_warp") {
    setFx("slow", 6000);
    toast("Time Warp");
  } else if (state.run.selectedAbility === "score_burst") {
    state.run.score += 120;
    toast("Score Burst +120");
  } else if (state.run.selectedAbility === "shield_surge") {
    state.run.shields = Math.min(state.run.config.maxShields, state.run.shields + 2);
    toast("Shield Surge +2");
  } else if (state.run.selectedAbility === "clear_hunt") {
    for (const el of gameArea.querySelectorAll(".target.minus,.target.decoy")) {
      el.remove();
    }
    toast("Clear Hunt");
  }

  state.run.abilityUses += 1;
  state.run.abilityReadyAt = Date.now() + ability.cooldown * 1000;
  telemetryEvent("ability_used", { ability: state.run.selectedAbility, uses: state.run.abilityUses });
  tone(640, 120, "triangle", 0.05);
  renderHud();
}

function bindMenuEvents() {
  messageEl.addEventListener("pointerdown", (e) => e.stopPropagation());

  messageEl.addEventListener("click", (e) => {
    const startBtn = e.target.closest("#startBtn");
    if (startBtn) {
      if (state.settings.playMode === "campaign" && state.menuScreen !== "campaign-map") {
        renderCampaignMapMenu();
      } else {
        startDuelSeeded();
      }
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
      if (state.menuScreen === "progress") renderProgressMenu();
      else renderMainMenu();
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

    const playModeBtn = e.target.closest("[data-playmode]");
    if (playModeBtn) {
      const playMode = playModeBtn.getAttribute("data-playmode");
      if (playMode === "freeplay" || playMode === "campaign") {
        state.settings.playMode = playMode;
        saveSettings();
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

    const toggleSocialBtn = e.target.closest("[data-toggle-social]");
    if (toggleSocialBtn) {
      state.settings.socialEnabled = !state.settings.socialEnabled;
      if (!state.settings.socialEnabled) {
        state.privateRoom = null;
      }
      saveSettings();
      renderMainMenu();
      return;
    }

    const openShopBtn = e.target.closest("[data-open-shop]");
    if (openShopBtn) {
      renderShopMenu();
      return;
    }

    const openProgressBtn = e.target.closest("[data-open-progress]");
    if (openProgressBtn) {
      renderProgressMenu();
      return;
    }

    const openSocialBtn = e.target.closest("[data-open-social]");
    if (openSocialBtn) {
      renderSocialMenu();
      return;
    }

    const openCampaignMapBtn = e.target.closest("[data-open-campaign-map]");
    if (openCampaignMapBtn) {
      renderCampaignMapMenu();
      return;
    }

    const openHomeBtn = e.target.closest("[data-open-home]");
    if (openHomeBtn) {
      renderMainMenu();
      return;
    }

    const openReplayBtn = e.target.closest("[data-open-replay]");
    if (openReplayBtn) {
      renderReplayMenu();
      return;
    }

    const buyBtn = e.target.closest("[data-buy]");
    if (buyBtn) {
      buyItem(buyBtn.getAttribute("data-buy"));
      return;
    }

    const buyWeaponBtn = e.target.closest("[data-buy-weapon]");
    if (buyWeaponBtn) {
      buyWeapon(buyWeaponBtn.getAttribute("data-buy-weapon"));
      return;
    }

    const selectBtn = e.target.closest("[data-select]");
    if (selectBtn) {
      selectItem(selectBtn.getAttribute("data-select"));
      return;
    }

    const selectWeaponBtn = e.target.closest("[data-select-weapon]");
    if (selectWeaponBtn) {
      selectWeapon(selectWeaponBtn.getAttribute("data-select-weapon"));
      return;
    }

    const skillBtn = e.target.closest("[data-skill]");
    if (skillBtn) {
      upgradeSkill(skillBtn.getAttribute("data-skill"));
      return;
    }

    const perkBtn = e.target.closest("[data-perk]");
    if (perkBtn) {
      togglePerk(perkBtn.getAttribute("data-perk"));
      renderProgressMenu();
      return;
    }

    const abilitySelectBtn = e.target.closest("[data-ability]");
    if (abilitySelectBtn) {
      setAbility(abilitySelectBtn.getAttribute("data-ability"));
      renderProgressMenu();
      return;
    }

    const craftBtn = e.target.closest("[data-craft]");
    if (craftBtn) {
      craftRecipe(craftBtn.getAttribute("data-craft"));
      return;
    }

    const claimPassBtn = e.target.closest("[data-claim-pass]");
    if (claimPassBtn) {
      claimBattlePassTier(Number(claimPassBtn.getAttribute("data-claim-pass")));
      if (state.menuScreen === "progress") renderProgressMenu();
      else renderMainMenu();
      return;
    }

    const cloudLoginBtn = e.target.closest("[data-cloud-login]");
    if (cloudLoginBtn) {
      const input = messageEl.querySelector("#cloudIdInput");
      state.profile.cloudId = input ? input.value.trim().slice(0, 18) : "";
      saveProfile();
      toast("Cloud ID set");
      if (state.menuScreen === "social") renderSocialMenu();
      else renderMainMenu();
      return;
    }

    const apiSaveBtn = e.target.closest("[data-api-save]");
    if (apiSaveBtn) {
      const input = messageEl.querySelector("#apiUrlInput");
      state.settings.apiUrl = input ? input.value.trim() : "";
      saveSettings();
      toast(state.settings.apiUrl ? "API URL saved" : "API URL cleared");
      fetchOnlineBoard();
      renderSocialMenu();
      return;
    }

    const authLoginBtn = e.target.closest("[data-auth-login]");
    if (authLoginBtn) {
      const user = messageEl.querySelector("#authUserInput")?.value?.trim() || "";
      const pass = messageEl.querySelector("#authPassInput")?.value || "";
      if (!user || !pass) {
        toast("Username and password required");
        return;
      }
      authLogin(user, pass)
        .then(() => {
          toast("Logged in");
          renderSocialMenu();
        })
        .catch((err) => toast(err.message || "Login failed"));
      return;
    }

    const authRegisterBtn = e.target.closest("[data-auth-register]");
    if (authRegisterBtn) {
      const user = messageEl.querySelector("#authUserInput")?.value?.trim() || "";
      const pass = messageEl.querySelector("#authPassInput")?.value || "";
      if (!user || !pass) {
        toast("Username and password required");
        return;
      }
      authRegister(user, pass)
        .then(() => {
          toast("Registered");
          renderSocialMenu();
        })
        .catch((err) => toast(err.message || "Register failed"));
      return;
    }

    const authLogoutBtn = e.target.closest("[data-auth-logout]");
    if (authLogoutBtn) {
      authLogout();
      toast("Logged out");
      renderSocialMenu();
      return;
    }

    const cloudPushBtn = e.target.closest("[data-cloud-push]");
    if (cloudPushBtn) {
      cloudPush()
        .then(() => toast("Cloud pushed"))
        .catch((err) => toast(err.message || "Cloud push failed"));
      return;
    }

    const cloudPullBtn = e.target.closest("[data-cloud-pull]");
    if (cloudPullBtn) {
      cloudPull()
        .then(() => {
          toast("Cloud pulled");
          renderSocialMenu();
        })
        .catch((err) => toast(err.message || "Cloud pull failed"));
      return;
    }

    const cloudExportBtn = e.target.closest("[data-cloud-export]");
    if (cloudExportBtn) {
      const code = exportCloudCode();
      navigator.clipboard?.writeText(code);
      toast("Cloud code copied");
      return;
    }

    const cloudImportBtn = e.target.closest("[data-cloud-import]");
    if (cloudImportBtn) {
      const input = messageEl.querySelector("#cloudCodeInput");
      importCloudCode(input ? input.value : "");
      return;
    }

    const addFriendBtn = e.target.closest("[data-add-friend]");
    if (addFriendBtn) {
      if (!state.settings.socialEnabled) {
        toast("Enable Social first");
        return;
      }
      const input = messageEl.querySelector("#friendInput");
      addFriend(input ? input.value : "");
      renderSocialMenu();
      return;
    }

    const roomCreateBtn = e.target.closest("[data-room-create]");
    if (roomCreateBtn) {
      if (!state.settings.socialEnabled) {
        toast("Enable Social first");
        return;
      }
      const code = createPrivateRoomCode();
      navigator.clipboard?.writeText(code);
      toast("Room code copied");
      return;
    }

    const roomJoinBtn = e.target.closest("[data-room-join]");
    if (roomJoinBtn) {
      if (!state.settings.socialEnabled) {
        toast("Enable Social first");
        return;
      }
      const input = messageEl.querySelector("#roomCodeInput");
      joinPrivateRoom(input ? input.value : "");
      renderSocialMenu();
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
  if (!state.profile.unlocked.includes("weapon-single")) {
    state.profile.unlocked.push("weapon-single");
    saveProfile();
  }
  state.weekly = getWeeklyEvent();
  state.tournament = getActiveTournament();
  state.missions = loadMissions();
  telemetryEvent("app_boot", { version: "phase1", backend: backendEnabled() });
  updateStreak();
  applyCosmetics();
  fetchOnlineBoard().finally(() => {
    renderHud();
    renderMainMenu();
  });

  pauseBtn.addEventListener("click", pauseResume);
  abilityBtn.addEventListener("click", () => useAbility());
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

  if (state.timers.telemetry) clearInterval(state.timers.telemetry);
  state.timers.telemetry = setInterval(() => {
    flushTelemetry();
  }, 15000);
}

bootstrap();
