// WebSocket Service — Connects to PC Companion Agent

type MessageHandler = (data: any) => void;
type StatusHandler = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private statusHandlers: StatusHandler[] = [];
  private _isConnected = false;
  private serverUrl = '';

  get isConnected() {
    return this._isConnected;
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  onMessage(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        this.messageHandlers.set(type, handlers.filter(h => h !== handler));
      }
    };
  }

  connect(ip: string, port: number = 3333) {
    this.serverUrl = `ws://${ip}:${port}`;
    this.reconnectAttempts = 0;
    this._connect();
  }

  private _connect() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('[WS] Connected to PC agent');
        this._isConnected = true;
        this.reconnectAttempts = 0;
        this.statusHandlers.forEach(h => h(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(msg.type);
          if (handlers) {
            handlers.forEach(h => h(msg.data));
          }
          // Also fire catch-all handlers
          const allHandlers = this.messageHandlers.get('*');
          if (allHandlers) {
            allHandlers.forEach(h => h(msg));
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Connection closed');
        this._isConnected = false;
        this.statusHandlers.forEach(h => h(false));
        this._scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        this._isConnected = false;
        this.statusHandlers.forEach(h => h(false));
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      this._scheduleReconnect();
    }
  }

  private _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this._connect(), delay);
  }

  send(type: string, data?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, cannot send');
      return false;
    }
    this.ws.send(JSON.stringify({ type, data }));
    return true;
  }

  // Send command to launch a game on PC
  launchGame(appid: number) {
    return this.send('launch_game', { appid });
  }

  // Request current PC status
  requestStatus() {
    return this.send('request_status');
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
    this.statusHandlers.forEach(h => h(false));
  }
}

export const wsService = new WebSocketService();
export default wsService;
