# Gaming Platform Demo

A GitHub + Vercel-ready static gaming platform starter.

## Important
This starter uses client-side demo login credentials. The `data/users.js` file is public in a GitHub repository, so this is NOT secure authentication and must not be used for real accounts or real money.

This version uses virtual coins only and does not include deposits or real-money withdrawals.

## Demo account
Username: jdcek123
Password: 123456

## Structure

- `index.html` — login page
- `home.html` — game lobby
- `data/users.js` — demo users
- `data/games.js` — game list and icon URLs
- `games/sky-runner/` — sample game
- `games/coin-dash/` — sample game
- `games/target-blitz/` — sample game
- `assets/` — local assets if you want them

## Add another game

1. Create a folder inside `games/`, e.g. `games/my-game/`.
2. Put its `index.html` there.
3. Add an entry to `data/games.js`.
4. Put your GitHub raw image URL or Catbox image URL in the `icon` field.
5. The new game will appear on the homepage.

## Deploy to Vercel

Upload/push this folder to GitHub, then import the repository into Vercel. No build command is required.
