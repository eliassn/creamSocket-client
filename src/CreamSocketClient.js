import net from 'net';
import crypto from 'crypto';
import EventEmitter from 'events';
import {
  CreamSocketParser
} from './CreamSocketParser.js';

/**
 * Represents a WebSocket client.
 * Extends Node.js's EventEmitter to handle events.
 */
export class CreamSocketClient extends EventEmitter {
  /**
   * Creates an instance of CreamSocketClient.
   *
   * @param {Object} options - Client configuration options.
   * @param {string} options.host - Hostname of the WebSocket server.
   * @param {number} options.port - Port number of the WebSocket server.
   * @param {string} [options.path='/'] - Path of the WebSocket endpoint.
   * @param {string|string[]} [options.protocols=[]] - Optional WebSocket subprotocols.
   */
  constructor({
    host,
    port,
    path = '/',
    protocols = [],
    format = "json"
  }) {
    super();
    this.host = host;
    this.port = port;
    this.path = path;
    this.protocols = Array.isArray(protocols) ? protocols : [protocols];
    this.socket = null;
    this.connected = false;
    this.heartbeatInterval = null;
    this.parser = new CreamSocketParser(format);
    this.messageQueue = []; // Message queue for offline messages
    this.connect();
  }
  connect() {
    const url = `ws://${this.host}:${this.port}${this.path}`;
    this.socket = new WebSocket(url, this.protocols);

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
      this.connected = true;
      this.emit('open');
    };

    this.socket.onmessage = (event) => {
      const data = event.data;
      const frame = this.parser.decode(data);
      this.emit('message', frame);
    };

    this.socket.onclose = () => {
      console.log('Disconnected from server.');
      this.connected = false;
      this.emit('close');
      this.stopHeartbeat();
    };

    this.socket.onerror = (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    };
  }
  _performHandshake() {
    const key = crypto.randomBytes(16).toString('base64');
    this._key = key;

    const headers = [
      `GET ${this.path} HTTP/1.1`,
      `Host: ${this.host}:${this.port}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
    ];

    if (this.protocols.length > 0) {
      headers.push(`Sec-WebSocket-Protocol: ${this.protocols.join(', ')}`);
    }

    headers.push('\r\n');
    this.socket.write(headers.join('\r\n'));
  }

  _handleData(data) {
    if (!this.connected) {
      this._handleHandshakeResponse(data.toString());
      return;
    }

    const frame = this._decodeFrame(data);
    if (!frame) return;

    switch (frame.opcode) {
      case 0x1: // Text frame
        this.emit('message', frame.payload);
        break;
      case 0x8: // Connection close
        this.disconnect();
        break;
      case 0x9: // Ping
        this.pong(frame.payload);
        break;
      default:
        console.log(`Unhandled opcode: ${frame.opcode}`);
    }
  }

  _handleHandshakeResponse(response) {
    if (response.includes('101 Switching Protocols')) {
      console.log('WebSocket handshake successful.');
      this.connected = true;
      this.emit('open');
      this.startHeartbeat();
      this.flushQueue();
    } else {
      console.error('Invalid handshake response.');
      this.socket.destroy();
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const message = this.messageQueue.shift();
      this.socket.write(message);
    }
  }

  sendMessage(message) {
    if (this.socket && this.connected) {
      const encodedMessage = this.parser.encode(message);
      this.socket.send(encodedMessage);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  _handleDisconnect() {
    console.log('Disconnected from server.');
    this.connected = false;
    this.emit('close');
    this.stopHeartbeat();
  }

  _handleError(err) {
    console.error('Socket error:', err);
    this.emit('error', err);
  }

  _sendCloseFrame() {
    const frame = this._encodeFrame('', 0x8);
    this.socket.write(frame);
    this.socket.end();
  }

  startHeartbeat(interval = 30000) {
    this.heartbeatInterval = setInterval(() => this.ping(), interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  ping(payload = '') {
    const frame = this._encodeFrame(payload, 0x9);
    this.socket.write(frame);
  }

  pong(payload = '') {
    const frame = this._encodeFrame(payload, 0xA);
    this.socket.write(frame);
  }

  /**
   * Handles incoming data from the server.
   * @param {Buffer} data - The received data buffer.
   */
  _handleData(data) {
    if (!this.connected) {
      const response = data.toString();
      if (this._isHandshakeResponse(response)) {
        this._completeHandshake(response);
      } else {
        console.error('Invalid handshake response.');
        this.socket.destroy();
      }
      return;
    }

    const frame = this._decodeFrame(data);
    if (!frame) return;

    switch (frame.opcode) {
      case 0x1: // Text frame
        this.emit('message', frame.payload);
        break;
      case 0x2: // Notification frame
        this.emit('notification', frame.payload);
        break;
      case 0x8: // Connection close
        this.disconnect();
        break;
      case 0x9: // Ping
        this.pong(frame.payload);
        break;
      case 0xA: // Pong
        // Handle pong if implementing heartbeat
        break;
      default:
        console.log(`Unhandled opcode: ${frame.opcode}`);
    }
  }

  /**
   * Checks if the response is a valid WebSocket handshake response.
   * @param {string} response - The raw HTTP response.
   * @returns {boolean} - True if valid handshake.
   */
  _isHandshakeResponse(response) {
    return response.includes('101 Switching Protocols');
  }

  /**
   * Completes the WebSocket handshake.
   * @param {string} response - The raw HTTP response.
   */
  _completeHandshake(response) {
    const headers = this._parseHeaders(response);
    const acceptKey = headers['sec-websocket-accept'];
    const expectedAccept = this._generateAcceptValue(this._key);

    if (acceptKey === expectedAccept) {
      console.log('WebSocket handshake successful.');
      this.connected = true;
      this.emit('open');
      this.startHeartbeat(); // Start heartbeat after successful connection
    } else {
      console.error('Invalid Sec-WebSocket-Accept value.');
      this.socket.destroy();
    }
  }

  /**
   * Parses HTTP headers from the response.
   * @param {string} response - The raw HTTP response.
   * @returns {Object} - Parsed headers as key-value pairs.
   */
  _parseHeaders(response) {
    const lines = response.split('\r\n');
    const headers = {};
    lines.forEach((line) => {
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key.toLowerCase()] = value;
      }
    });
    return headers;
  }

  /**
   * Generates the expected Sec-WebSocket-Accept value.
   * @param {string} key - The Sec-WebSocket-Key sent to the server.
   * @returns {string} - The expected Sec-WebSocket-Accept value.
   */
  _generateAcceptValue(key) {
    return crypto
      .createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');
  }

  /**
   * Encodes a message into a WebSocket frame.
   * @param {string} message - The message to send.
   * @param {number} [opcode=0x1] - The opcode (0x1 for text).
   * @returns {Buffer} - The encoded frame.
   */
  _encodeFrame(message, opcode = 0x1) {
    const payload = Buffer.from(message);
    const payloadLength = payload.length;

    let frame = [];

    // First byte: FIN and opcode
    frame.push(0x80 | opcode);

    // Determine payload length
    if (payloadLength < 126) {
      frame.push(payloadLength);
    } else if (payloadLength < 65536) {
      frame.push(126);
      frame.push((payloadLength >> 8) & 0xff);
      frame.push(payloadLength & 0xff);
    } else {
      // Note: JavaScript can't handle integers larger than 2^53 - 1
      frame.push(127);
      // Push 8 bytes (64 bits) for payload length
      for (let i = 7; i >= 0; i--) {
        frame.push((payloadLength >> (i * 8)) & 0xff);
      }
    }

    return Buffer.concat([Buffer.from(frame), payload]);
  }

  /**
   * Decodes a WebSocket frame.
   * @param {Buffer} buffer - The received data buffer.
   * @returns {Object|null} - Decoded frame or null if invalid.
   */
  _decodeFrame(buffer) {
    if (buffer.length < 2) {
      console.error('Incomplete frame received.');
      return null;
    }

    const firstByte = buffer.readUInt8(0);
    const secondByte = buffer.readUInt8(1);

    const fin = (firstByte & 0x80) >> 7;
    const opcode = firstByte & 0x0f;
    const masked = (secondByte & 0x80) >> 7;
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (buffer.length < 4) {
        console.error('Incomplete extended payload length.');
        return null;
      }
      payloadLength = buffer.readUInt16BE(2);
      offset += 2;
    } else if (payloadLength === 127) {
      if (buffer.length < 10) {
        console.error('Incomplete extended payload length.');
        return null;
      }
      // Note: JavaScript can't handle integers larger than 2^53 - 1
      payloadLength = Number(buffer.readBigUInt64BE(2));
      offset += 8;
    }

    let maskingKey;
    if (masked) {
      if (buffer.length < offset + 4) {
        console.error('Incomplete masking key.');
        return null;
      }
      maskingKey = buffer.slice(offset, offset + 4);
      offset += 4;
    }

    if (buffer.length < offset + payloadLength) {
      console.error('Incomplete payload data.');
      return null;
    }

    const payload = buffer.slice(offset, offset + payloadLength);

    let decodedPayload = payload;
    if (masked) {
      decodedPayload = Buffer.alloc(payload.length);
      for (let i = 0; i < payload.length; i++) {
        decodedPayload[i] = payload[i] ^ maskingKey[i % 4];
      }
    }

    return {
      fin,
      opcode,
      payload: decodedPayload.toString()
    };
  }

  /**
   * Sends a Close frame to the server.
   */
  _sendCloseFrame() {
    const frame = this._encodeFrame('', 0x8);
    this.socket.write(frame);
    this.socket.end();
  }

  /**
   * Starts the heartbeat mechanism by sending Ping frames periodically.
   * @param {number} [interval=30000] - Heartbeat interval in milliseconds.
   */
  startHeartbeat(interval = 30000) {
    this.heartbeatInterval = setInterval(() => {
      this.ping();
    }, interval);
  }

  /**
   * Stops the heartbeat mechanism.
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}