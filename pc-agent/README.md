# GameHand PC Agent

A lightweight companion agent that runs on your gaming PC. It connects to the GameHand mobile app over your local Wi-Fi network.

## Features

- 🔍 **Auto-detect running games** — Monitors active processes and identifies games
- 🚀 **Remote game launch** — Start Steam games from your phone
- 📊 **Session tracking** — Sends real-time session duration to the app
- 🔗 **WebSocket connection** — Fast, bidirectional communication

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or later installed on your PC

### Installation

```bash
cd pc-agent
npm install
```

### Running

```bash
npm start
# or
node agent.js
```

The agent will display your PC's IP address. Enter this IP in the GameHand app under **PC Connect**.

```
╔══════════════════════════════════════════════╗
║          🎮 GameHand PC Agent 1.0            ║
╠══════════════════════════════════════════════╣
║  Server running on:                          ║
║  IP: 192.168.1.100                           ║
║  Port: 3333                                  ║
╚══════════════════════════════════════════════╝
```

### Important Notes

- Your PC and phone **must be on the same Wi-Fi network**
- The agent runs on **port 3333** by default
- Windows Firewall may ask to allow Node.js through — click **Allow**
- The agent only works when it's running in a terminal window

## Supported Games

The agent detects games by their process name. Currently includes popular titles like:
- Counter-Strike 2, Dota 2, GTA V, Elden Ring
- Cyberpunk 2077, Baldur's Gate 3, Starfield
- And many more...

You can add your own games by editing the `KNOWN_GAMES` object in `agent.js`.
