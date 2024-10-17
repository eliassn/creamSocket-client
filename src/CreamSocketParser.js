/**
 * Represents a parser for encoding and decoding messages and notifications.
 */
export class CreamSocketParser {
  /**
   * Creates an instance of CreamSocketParser.
   * @param {string} format - The data format ('json' or 'binary').
   */
  constructor(format = 'json') {
    this.format = format;
  }

  /**
   * Encodes data based on the specified format.
   * @param {string | object} data - The data to encode.
   * @param {number} [opcode=0x1] - The WebSocket opcode (0x1 for text, 0x2 for binary, etc.).
   * @returns {Buffer} - The encoded frame.
   */
  encode(data, opcode = 0x1) {
    let payload;

    // Encode data based on the format (JSON or binary)
    if (this.format === 'json') {
      if (typeof data === 'object') {
        payload = Buffer.from(JSON.stringify(data));
      } else {
        payload = Buffer.from(String(data));
      }
    } else if (this.format === 'binary') {
      payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
    }

    const payloadLength = payload.length;
    const frame = [];

    // First byte: FIN and opcode
    frame.push(0x80 | opcode);

    // Encode payload length
    if (payloadLength < 126) {
      frame.push(payloadLength);
    } else if (payloadLength < 65536) {
      frame.push(126, (payloadLength >> 8) & 0xff, payloadLength & 0xff);
    } else {
      frame.push(127);
      for (let i = 7; i >= 0; i--) {
        frame.push((payloadLength >> (i * 8)) & 0xff);
      }
    }

    // Return the complete frame as a buffer
    return Buffer.concat([Buffer.from(frame), payload]);
  }

  /**
   * Decodes data based on the specified format.
   * @param {Buffer} data - The data to decode.
   * @returns {object | string | Buffer} - The decoded data.
   */
  decode(data) {
    let decodedData;

    // Decode data based on the format
    if (this.format === 'json') {
      try {
        decodedData = JSON.parse(data.toString());
      } catch (error) {
        console.error('Failed to decode JSON data:', error);
        return null;
      }
    } else if (this.format === 'binary') {
      try {
        decodedData = Buffer.isBuffer(data) ? data : Buffer.from(data);
      } catch (error) {
        console.error('Failed to decode binary data:', error);
        return data; // Return raw data if unable to decode
      }
    }

    return decodedData;
  }

  /**
   * Handles incoming messages.
   * @param {Buffer | string} data - The received message data.
   * @param {net.Socket} socket - The client's socket for potential response.
   * @returns {object | string | null} - The processed message or notification.
   */
  handleMessage(data, socket) {
    const message = this.decode(data);

    if (!message) {
      console.error('Invalid message format.');
      return null;
    }

    if (message.type === 'message') {
      console.log('Message received:', message.payload);
      return message.payload;
    } else if (message.type === 'notification') {
      return this.handleNotification(message, socket);
    } else {
      console.warn('Unknown message type:', message);
      return null;
    }
  }

  /**
   * Handles incoming notifications.
   * @param {object} notification - The received notification object.
   * @param {net.Socket} socket - The client's socket for potential response.
   * @returns {object} - The processed notification.
   */
  handleNotification(notification, socket) {
    if (!notification.payload) {
      console.error('Notification payload missing.');
      return null;
    }

    console.log('Notification received:', notification.payload);

    // If needed, send a response or acknowledgment to the client
    if (notification.responseRequired) {
      const acknowledgment = {
        type: 'ack',
        message: 'Notification received successfully',
      };
      socket.write(this.encode(acknowledgment));
    }

    return notification.payload;
  }

  /**
   * Handles sending a message.
   * @param {net.Socket} socket - The target client's socket.
   * @param {string | object} message - The message to send.
   */
  sendMessage(socket, message) {
    const frame = this.encode({
      type: 'message',
      payload: message,
    });
    socket.write(frame);
  }

  /**
   * Handles sending a notification.
   * @param {net.Socket} socket - The target client's socket.
   * @param {string | object} notification - The notification to send.
   */
  sendNotification(socket, notification) {
    const frame = this.encode({
      type: 'notification',
      payload: notification,
      responseRequired: true, // Specify if acknowledgment is needed
    }, 0x2); // 0x2 for binary data if needed

    socket.write(frame);
  }
}