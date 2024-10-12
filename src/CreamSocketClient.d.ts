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
}

/**
 * Represents a WebSocket client.
 * Extends Node.js's EventEmitter to handle events.
 */
export declare class CreamSocketClient extends EventEmitter {
  /**
   * Creates an instance of AdvancedSocketClient.
   *
   * @param {CreamSocketClientOptions} options - Client configuration options.
   */
  constructor(options: CreamSocketClientOptions);

  /**
   * Initiates a connection to the WebSocket server.
   *
   * @returns {void}
   */
  connect(): void;

  /**
   * Disconnects from the WebSocket server gracefully.
   *
   * @returns {void}
   */
  disconnect(): void;

  /**
   * Sends a text message to the server.
   *
   * @param {string} message - The message to send.
   * @returns {void}
   */
  sendMessage(message: string): void;

  /**
   * Sends a Ping frame to the server to keep the connection alive.
   *
   * @param {string} [payload=''] - Optional payload for the Ping.
   * @returns {void}
   */
  ping(payload?: string): void;

  /**
   * Sends a Pong frame to the server in response to a Ping.
   *
   * @param {string} [payload=''] - Optional payload for the Pong.
   * @returns {void}
   */
  pong(payload?: string): void;

  /**
   * Emits an 'open' event when the connection is successfully established.
   *
   * @event CreamSocketClient#open
   */
  on(event: 'open', listener: () => void): this;

  /**
   * Emits a 'message' event when a message is received from the server.
   *
   * @event CreamSocketClient#message
   * @param {string} message - The received message.
   */
  on(event: 'message', listener: (message: string) => void): this;

  /**
   * Emits a 'close' event when the connection is closed by the server.
   *
   * @event CreamSocketClient#close
   */
  on(event: 'close', listener: () => void): this;

  /**
   * Emits an 'error' event when an error occurs.
   *
   * @event CreamSocketClient#error
   * @param {Error} error - The encountered error.
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
  emit(event: 'close'): boolean;
  emit(event: 'error', error: Error): boolean;
  emit(event: string, ...args: any[]): boolean;
}
