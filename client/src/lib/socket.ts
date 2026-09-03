// ── SOCKET.IO CLIENT ────────────────────────────────────────────────────────
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: { token: localStorage.getItem('fw_token') },
    });
  }
  return socket;
}

export function connectSocket(userId: number): void {
  const s = getSocket();
  s.auth = { token: localStorage.getItem('fw_token') };
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
