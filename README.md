# Duck Hunting Mobile Game

A mobile-first duck hunting shooter built with plain HTML, CSS, and JavaScript.

## Play locally

1. Open `index.html` directly in your browser, or
2. Run a local server in this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish on GitHub (GitHub Pages)

1. Create a new GitHub repository.
2. Push this folder to the `main` branch.
3. In GitHub, go to **Settings -> Pages**.
4. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` and `/ (root)`
5. Save and wait about 1 minute.
6. Your game will be available at:
   - `https://<your-username>.github.io/<repo-name>/`

## Controls

- Tap a duck to score points.
- Build combos to increase multiplier and trigger `Frenzy` mode.
- Hit rare `⏰` clock targets to gain `+10` seconds.
- Hitting red penalty ducks lowers your score.
- Hit `🛡️` shield targets to block future misses.
- Hit `❄️` targets to activate temporary slow motion.
- Every 6-hit streak grants a small bonus (`+2s` and score boost).
- Tapping empty space counts as a miss.
- Speed and spawn pressure increase over time with level progression.
- Choose `Easy`, `Normal`, or `Hard` mode from the home screen.
- Toggle sound and haptics in the home menu.
- You lose when max misses for the selected mode is reached, or when timer reaches 0.
- Best score and leaderboard are saved on your device.
- Live accuracy percentage is tracked in the HUD and shown on game over.
