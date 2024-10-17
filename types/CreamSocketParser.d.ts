// CreamSocketParser.d.ts

import { Socket } from 'net';

export declare class CreamSocketParser {
  /**
   * Creates an instance of CreamSocketParser.
   * @param format - The data format ('json' or 'binary').
   */
  constructor(format?: 'json' | 'binary');

  /**
   * Encodes data based on the specified format.
   * @param data - The data to encode (string or object for JSON, or Buffer for binary).
   * @param opcode - The WebSocket opcode (0x1 for text, 0x2 for binary, etc.).
   * @returns The encoded frame as a Buffer.
   */
  encode(data: string | object | Buffer, opcode?: number): Buffer;

  /**
   * Decodes data based on the specified format.
   * @param data - The data to decode (Buffer).
   * @returns The decoded data (string for JSON or Buffer for binary).
   */
  decode(data: Buffer): object | string | Buffer;

  /**
   * Handles incoming messages.
   * @param data - The received message data (Buffer or string).
   * @param socket - The client's socket for potential response.
   * @returns The processed message or notification (object or string).
   */
  handleMessage(data: Buffer | string, socket: Socket): object | string | null;

  /**
   * Handles incoming notifications.
   * @param notification - The received notification object.
   * @param socket - The client's socket for potential response.
   * @returns The processed notification (object).
   */
  handleNotification(notification: object, socket: Socket): object | null;

  /**
   * Sends a message to a specific client.
   * @param socket - The target client's socket.
   * @param message - The message to send (string or object).
   */
  sendMessage(socket: Socket, message: string | object): void;

  /**
   * Sends a notification to a specific client.
   * @param socket - The target client's socket.
   * @param notification - The notification to send (string or object).
   */
  sendNotification(socket: Socket, notification: string | object): void;
}

