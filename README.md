# creamSocketClient
A client for webSocket interaction
```javascript

// client.js

const { CreamSocketClient } = require('creamsocket-client');

const client = new CreamSocketClient({
  host: 'localhost',
  port: 8080,
  path: '/',
});

client.on('open', () => {
  console.log('Connected to the server.');

  // Send a message to the server
  client.sendMessage('Hello, Server!');
});

client.on('message', (msg) => {
  console.log('Received message from server:', msg);
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
