/**
 * GameHand PC Agent
 * 
 * Runs on the user's gaming PC.
 * - Opens a WebSocket server on port 3333
 * - Detects currently running game processes (Windows)
 * - Sends game status updates to the connected mobile app
 * - Receives "launch game" commands → opens steam://run/<appid>
 */

const { WebSocketServer } = require('ws');
const { exec, execSync } = require('child_process');
const os = require('os');

const PORT = 3333;
const POLL_INTERVAL = 5000; // 5 seconds

// Known Steam game executables → appid mapping (expandable)
const KNOWN_GAMES = {
  'csgo.exe': { appid: 730, name: 'Counter-Strike 2' },
  'cs2.exe': { appid: 730, name: 'Counter-Strike 2' },
  'dota2.exe': { appid: 570, name: 'Dota 2' },
  'GTA5.exe': { appid: 271590, name: 'Grand Theft Auto V' },
  'RocketLeague.exe': { appid: 252950, name: 'Rocket League' },
  'VALORANT.exe': { appid: 0, name: 'VALORANT' },
  'Cyberpunk2077.exe': { appid: 1091500, name: 'Cyberpunk 2077' },
  'eldenring.exe': { appid: 1245620, name: 'Elden Ring' },
  'bg3.exe': { appid: 1086940, name: "Baldur's Gate 3" },
  'Hogwarts Legacy.exe': { appid: 990080, name: 'Hogwarts Legacy' },
  'Minecraft.Windows.exe': { appid: 0, name: 'Minecraft' },
  'javaw.exe': { appid: 0, name: 'Minecraft (Java)' },
  'Overwatch.exe': { appid: 0, name: 'Overwatch 2' },
  'FortniteClient-Win64-Shipping.exe': { appid: 0, name: 'Fortnite' },
  'starfield.exe': { appid: 1716740, name: 'Starfield' },
  'witcher3.exe': { appid: 292030, name: 'The Witcher 3' },
  'RDR2.exe': { appid: 1174180, name: 'Red Dead Redemption 2' },
  'HorizonZeroDawn.exe': { appid: 1151640, name: 'Horizon Zero Dawn' },
  'GodOfWar.exe': { appid: 1593500, name: 'God of War' },
  'Palworld-Win64-Shipping.exe': { appid: 1623730, name: 'Palworld' },
  'Lethal Company.exe': { appid: 1966720, name: 'Lethal Company' },
  'Helldivers2.exe': { appid: 553850, name: 'Helldivers 2' },
};

let currentGame = null;
let sessionStart = Date.now();
let clients = new Set();

// Get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Detect running game (Windows)
function detectGame() {
  try {
    const output = execSync('tasklist /FO CSV /NH', { encoding: 'utf-8', timeout: 5000 });
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/"([^"]+)"/);
      if (match) {
        const processName = match[1];
        if (KNOWN_GAMES[processName]) {
          return KNOWN_GAMES[processName];
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Launch game via Steam
function launchGame(appid) {
  if (!appid || appid === 0) {
    console.log(`[Agent] Cannot launch: no appid`);
    return false;
  }
  const url = `steam://run/${appid}`;
  console.log(`[Agent] Launching: ${url}`);
  
  // Windows
  exec(`start "" "${url}"`, (err) => {
    if (err) console.error('[Agent] Launch error:', err.message);
  });
  return true;
}

// Broadcast to all connected clients
function broadcast(type, data) {
  const msg = JSON.stringify({ type, data });
  for (const ws of clients) {
    if (ws.readyState === 1) { // OPEN
      ws.send(msg);
    }
  }
}

// Start WebSocket server
const wss = new WebSocketServer({ port: PORT });
const localIP = getLocalIP();

console.log(`
╔══════════════════════════════════════════════╗
║          🎮 GameHand PC Agent 1.0            ║
╠══════════════════════════════════════════════╣
║                                              ║
║  Server running on:                          ║
║  IP: ${localIP.padEnd(38)}║
║  Port: ${String(PORT).padEnd(36)}║
║                                              ║
║  Enter this IP in the GameHand app           ║
║  on the PC Connect screen.                   ║
║                                              ║
║  PC Name: ${os.hostname().padEnd(32)}║
║                                              ║
╚══════════════════════════════════════════════╝
`);

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[Agent] Mobile app connected (${clients.size} client${clients.size > 1 ? 's' : ''})`);

  // Send initial status
  const game = detectGame();
  ws.send(JSON.stringify({
    type: 'status_update',
    data: {
      currentGame: game?.name || null,
      currentGameAppId: game?.appid || null,
      sessionDuration: Math.floor((Date.now() - sessionStart) / 1000),
      pcName: os.hostname(),
    },
  }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      console.log(`[Agent] Received: ${msg.type}`, msg.data || '');

      switch (msg.type) {
        case 'launch_game':
          const success = launchGame(msg.data?.appid);
          ws.send(JSON.stringify({
            type: 'launch_result',
            data: { success, appid: msg.data?.appid },
          }));
          break;

        case 'request_status':
          const current = detectGame();
          ws.send(JSON.stringify({
            type: 'status_update',
            data: {
              currentGame: current?.name || null,
              currentGameAppId: current?.appid || null,
              sessionDuration: Math.floor((Date.now() - sessionStart) / 1000),
              pcName: os.hostname(),
            },
          }));
          break;

        default:
          console.log(`[Agent] Unknown message type: ${msg.type}`);
      }
    } catch (err) {
      console.error('[Agent] Message parse error:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[Agent] Client disconnected (${clients.size} remaining)`);
  });
});

// Poll for game changes
let lastGameName = null;
setInterval(() => {
  const game = detectGame();
  const gameName = game?.name || null;

  if (gameName !== lastGameName) {
    if (gameName) {
      console.log(`[Agent] 🎮 Game detected: ${gameName}`);
    } else if (lastGameName) {
      console.log(`[Agent] Game closed: ${lastGameName}`);
    }
    lastGameName = gameName;
    currentGame = game;

    broadcast('game_changed', {
      gameName,
      appid: game?.appid || null,
    });
  }

  // Send periodic status updates
  broadcast('status_update', {
    currentGame: gameName,
    currentGameAppId: game?.appid || null,
    sessionDuration: Math.floor((Date.now() - sessionStart) / 1000),
    pcName: os.hostname(),
  });
}, POLL_INTERVAL);

console.log('[Agent] Watching for game processes...\n');
