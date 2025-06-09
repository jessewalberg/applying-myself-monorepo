// Auto-reload client for development
class AutoReloader {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(private port: number = 8080) {
    this.connect();
  }

  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);
      
      this.ws.onopen = () => {
        console.log('🔄 Auto-reload connected');
        this.reconnectAttempts = 0;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'reload') {
            console.log('🔄 Reloading extension:', message.reason);
            this.reloadExtension();
          }
        } catch (error) {
          console.error('🔄 Failed to parse reload message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔄 Auto-reload disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.log('🔄 Auto-reload connection error');
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('🔄 Failed to connect to auto-reload server:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔄 Max reconnection attempts reached. Auto-reload disabled.');
      return;
    }

    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private reloadExtension(): void {
    try {
      // Send message to background script to reload
      chrome.runtime.sendMessage({ type: 'RELOAD_EXTENSION' }, () => {
        if (chrome.runtime.lastError) {
          // Fallback: try to reload directly
          chrome.runtime.reload();
        }
      });
    } catch (error) {
      console.error('🔄 Failed to reload extension:', error);
      // Final fallback: hard reload
      window.location.reload();
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Only enable auto-reload in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Auto-reload enabled for development');
  const reloader = new AutoReloader();
  
  // Clean up on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      reloader.disconnect();
    });
  }
} 