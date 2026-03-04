# Duck Hunting Mobile Game

A simple mobile-first duck hunting shooting game built with plain HTML, CSS, and JavaScript.

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
- Chain hits to increase combo multiplier (`x2` then `x3`).
- Golden bonus ducks are worth more points and add extra time.
- Tapping empty space counts as a miss.
- Speed increases over time as difficulty ramps up.
- You lose after 8 misses, or when the timer reaches 0.
- Best score is saved on your device.
