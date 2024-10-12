// AdvancedSocketClient.d.ts

/**
 * Options for initializing the AdvancedSocketClient.
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
   * @event CreamSocketClientOptions#open
   */

  /**
   * Emits a 'message' event when a message is received from the server.
   *
   * @event CreamSocketClientOptions#message
   * @param {string} message - The received message.
   */

  /**
   * Emits a 'close' event when the connection is closed by the server.
   *
   * @event CreamSocketClientOptions#close
   */

  /**
   * Emits an 'error' event when an error occurs.
   *
   * @event CreamSocketClientOptions#error
   * @param {Error} error - The encountered error.
   */
}
