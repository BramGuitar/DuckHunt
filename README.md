# Duck Hunting Mobile Game (Next Level)

A mobile-first duck hunting shooter built with plain HTML/CSS/JS and upgraded with progression, economy, and competitive systems.

## Features implemented

1. Online leaderboard hooks + anti-cheat proof payload
2. Weekly rotating events (deterministic by ISO week)
3. Unlock system (skins, crosshairs, trails, badges)
4. Daily missions + login streak rewards
5. Boss waves with patterns (`zigzag`, `shielded`, `rage`)
6. Skill tree upgrades (combo grace, shield cap, clock value)
7. Audio/haptics pack with toggles
8. Coins + in-game shop economy (separate shop menu)
9. Async duels + private room code flow (optional social menu)
10. Replay/challenge code (seeded run sharing) + replay viewer
11. Weapon system (`single`, `spread`, `pierce`, `burst`) as shop upgrades
12. Limited-time tournaments with reward claims
13. Cloud backup/login code import/export
14. Battle pass progression + tier rewards
15. Dynamic weather with gameplay effects

## Navigation updates

- Economy + Shop now opens in a dedicated menu page.
- A `Go to Shop` button is available on the game-over screen.
- Main menu is simplified with quick links: `Progress`, `Shop`, `Social`.
- Friends + Private Rooms are optional and can be enabled/disabled from Main Menu.

## Play locally

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## GitHub Pages

1. Push to `main`
2. In GitHub: `Settings -> Pages`
3. Source: `Deploy from a branch`
4. Branch: `main` + `/ (root)`

## Online leaderboard setup (optional)

The game works fully with local leaderboard by default.

## Phase 1 backend integration

Phase 1 is now wired in-app with local fallback:

- Auth session support (register/login/logout)
- Cloud sync push/pull (profile + missions + leaderboard + duel state)
- Authoritative score submit payload (`proof`, `seed`)
- Telemetry queue with periodic batch flush

Configure backend URL in the **Social Hub** (`API URL`) or in settings storage.

### Expected backend endpoints

- `POST /auth/register` body: `username`, `password`, `game`
- `POST /auth/login` body: `username`, `password`, `game`
- `GET /cloud/profile` (auth required)
- `POST /cloud/profile` (auth required) body: `game`, `profile`, `missions`, `leaderboard`, `duel`
- `GET /scores/top?game=duck-v2`
- `POST /scores/submit` body: `game`, `name`, `score`, `mode`, `week`, `proof`, `seed`
- `POST /telemetry/batch` body: `game`, `events[]`

If no backend URL is set, the game keeps working with local storage and local leaderboard.

## Phase 2 started (implemented)

- Weapon loadout upgrades in shop
- Perk loadout (max 2) and hero ability selection
- In-run hero ability button with cooldown
- Duck classes: armored, teleport, split, decoy
- Split play styles: `Free Play` and `Campaign`
- Campaign route has 10 escalating steps; each campaign run gets harder
- After 10 campaign runs, the next campaign run is a boss battle
- Campaign now has multiple chapters, each with its own state-based USA route map
- Crafting materials economy (`feather`, `gear`, `core`) and recipes
