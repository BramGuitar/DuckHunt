# Duck Hunting Mobile Game (Next Level)

A mobile-first duck hunting shooter built with plain HTML/CSS/JS and upgraded with progression, economy, and competitive systems.

## Features implemented

1. Online leaderboard hooks + anti-cheat proof payload
2. Weekly rotating events (deterministic by ISO week)
3. Unlock system (skins, crosshairs, trails, badges)
4. Daily missions + login streak rewards
5. Boss waves
6. Skill tree upgrades (combo grace, shield cap, clock value)
7. Audio/haptics pack with toggles
8. Coins + in-game shop economy
9. Async duels using shareable duel code
10. Replay/challenge code (seeded run sharing)

## Navigation updates

- Economy + Shop now opens in a dedicated menu page.
- A `Go to Shop` button is available on the game-over screen.

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

For real online rankings, set `ONLINE_LEADERBOARD_URL` in [`game.js`](/Users/bramvanderzanden/Documents/Duck%20Hunting/game.js) to your backend endpoint that supports:

- `GET /top?game=duck-v2`
- `POST /submit`

`POST /submit` receives fields:
- `game`, `name`, `score`, `mode`, `week`, `proof`, `seed`

Use `proof` + `seed` server-side to validate submissions.
