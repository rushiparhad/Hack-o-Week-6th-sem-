/**
 * Socket.io Service
 * Handles real-time communication with backend
 */

import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  /**
   * Connect to Socket.io server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_SERVER_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('✅ Connected to backend');
          resolve();
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('❌ Disconnected from backend');
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Listen for metric updates
   */
  onMetricUpdate(callback) {
    if (this.socket) {
      this.socket.off('metric_update');
      this.socket.on('metric_update', callback);
    }
  }

  /**
   * Listen for new alerts
   */
  onNewAlert(callback) {
    if (this.socket) {
      this.socket.off('new_alert');
      this.socket.on('new_alert', callback);
    }
  }

  /**
   * Listen for initial state
   */
  onInitialState(callback) {
    if (this.socket) {
      this.socket.off('initial_state');
      this.socket.on('initial_state', callback);
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

export default socketService;
