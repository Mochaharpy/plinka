# plinka

A game loader that uses `bonjour-service` and `socket.io`to provide Jackbox-style games on lan.

## Prerequisites
- **Node.js** and **pnpm**
- Basic familiarity with TypeScript or Javascript

## Getting Started

1. Intall dependencies
```bash
pnpm install
```
2. Build the project
```bash
pnpm build
```

## How to use

### Developing Games
1. Create a new folder for your game inside of `src/games/`
2. Run `pnpm dev:games` to start the server and watch `src/games/` for code changes
3. Open `http://localhost/host` or `http://game.local/controller` in browser to access host and controller screens.
4. Run `pnpm build:games` to compile your game for production.

### Adding to Plinka
- Run `pnpm dev` to start the server with typescript watching the `client` and `server` directories.
- Add a pull request if you have something to add.