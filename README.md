# creamSocketClient
## CreamSocketClient now supports notifications
- Click [Documentation](https://github.com/eliassn/creamSocket-client/wiki/CreamSocketClient)
- If you like this project please consider support [:heart: Sponsor](https://github.com/sponsors/eliassn)
## if you are using typescript try adding the following line to your tsconfig file 
```json
"moduleResolution": "NodeNext"
```
- Example

```javascript

// client.js

import { CreamSocketClient } from 'creamsocket-client';

const client = new CreamSocketClient({
  host: 'localhost',
  port: 8080,
  path: '/',
});

client.on('open', () => {
  console.log('Connected to the server.');

  // Send a message to the server
  client.sendMessage('Hello, Server!');
  client.sendNotification('Client has joined the chat.');
});

client.on('message', (msg) => {
  console.log('Received message from server:', msg);
});

client.on('notification', (notification) => {
  console.log('Received notification from server:', notification);
});

client.on('close', () => {
  console.log('Connection closed by the server.');
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});

// Connect to the server
client.connect();
```
