// sse/notificationSSE.ts
import { fetchEventSource } from '@microsoft/fetch-event-source';

class NotificationSSE {
  private controller: AbortController | null = null;
  private connected = false;

  connect(headers: Record<string, string>, onMessage: (data: any) => void) {
    if (this.connected) {
      console.log('SSE already connected');
      return;
    }

    this.controller = new AbortController();
    this.connected = true;

    fetchEventSource('http://localhost:8081/api/v1/notifications/stream', {
      signal: this.controller.signal,
      headers,

      async onopen(res) {
        if (!res.ok) {
          throw new Error(`SSE failed: ${res.status}`);
        }
        console.log('SSE connected');
      },

      onmessage(msg) {
        if (!msg.data || msg.event !== 'notification') return;
        onMessage(JSON.parse(msg.data));
      },

      onclose: () => {
        console.log('SSE closed');
        this.connected = false;
        this.controller = null;
      },

      onerror: (err) => {
        console.error('SSE error', err);
        this.disconnect(); 
        throw err; 
      },
    });
  }

  disconnect() {
    this.controller?.abort();
    this.controller = null;
    this.connected = false;
  }
}

export const notificationSSE = new NotificationSSE();
