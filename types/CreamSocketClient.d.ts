import { EventEmitter } from 'events';
/**
 * Options for initializing the CreamSocketClient.
 */
export interface CreamSocketClientOptions {
  /**
   * Hostname of the WebSocket server to connect to.
   */
  host: string;

  /**
   * Port number of the WebSocket server.
   */
  port: number;

  /**
   * Path of the WebSocket endpoint. Defaults to '/'.
   */
  path?: string;

  /**
   * Optional WebSocket subprotocols.
   */
  protocols?: string | string[];
  
  socket: net.Socket | null;
  connected: boolean;
  heartbeatInterval: NodeJS.Timeout | null;
  /**
   * Format of the parsed data'.
   */
  format?: 'json' | 'binary';
}

/**
 * Represents a WebSocket client.
 * Extends Node.js's EventEmitter to handle events.
 */
export declare class CreamSocketClient extends EventEmitter {
  /**
   * Creates an instance of CreamSocketClient.
   *
   * @param {CreamSocketClientOptions} options - Client configuration options.
   */
  constructor(options: CreamSocketClientOptions);

 /**
   * Initiates a connection to the WebSocket server.
   */
 connect(): void;

 /**
  * Disconnects from the WebSocket server gracefully.
  */
 disconnect(): void;

 /**
  * Sends a message to the server.
  * @param message - The message to send. Can be a string or an object.
  */
 sendMessage(message: string | object): void;

 /**
  * Sends a notification to the server.
  * @param notification - The notification to send. Can be a string or an object.
  */
 sendNotification(notification: string | object): void;

 /**
  * Sends a Ping frame to the server to keep the connection alive.
  * @param payload - Optional payload for the Ping.
  */
 ping(payload?: string): void;

 /**
  * Sends a Pong frame to the server in response to a Ping.
  * @param payload - Optional payload for the Pong.
  */
 pong(payload?: string): void;

 /**
  * Event listener for 'message' events.
  * @param data - The received message data.
  */
 on(event: 'message', listener: (data: any) => void): this;

 /**
  * Event listener for 'notification' events.
  * @param data - The received notification data.
  */
 on(event: 'notification', listener: (data: any) => void): this;

 /**
  * Event listener for 'open' events.
  */
 on(event: 'open', listener: () => void): this;

 /**
  * Event listener for 'close' events.
  */
 on(event: 'close', listener: () => void): this;

 /**
  * Event listener for 'error' events.
  * @param error - The error object.
  */
 on(event: 'error', listener: (error: Error) => void): this;

  /**
   * Removes a listener for the specified event.
   *
   * @param {string} event - The event name.
   * @param {Function} listener - The listener function to remove.
   * @returns {this}
   */
  off(event: 'open', listener: () => void): this;
  off(event: 'message', listener: (message: string) => void): this;
  off(event: 'notification', listener: (notification: string) => void): this;
  off(event: 'close', listener: () => void): this;
  off(event: 'error', listener: (error: Error) => void): this;
  off(event: string, listener: Function): this;

  /**
   * Overrides the EventEmitter's emit method for type safety.
   *
   * @param {string} event - The event name.
   * @param  {...any} args - The event arguments.
   * @returns {boolean}
   */
  emit(event: 'open'): boolean;
  emit(event: 'message', message: string): boolean;
  emit(event: 'notification', notification: string): boolean;
  emit(event: 'close'): boolean;
  emit(event: 'error', error: Error): boolean;
  emit(event: string, ...args: any[]): boolean;
}
