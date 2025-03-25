const osc = require('node-osc');
const client = new osc.Client('127.0.0.1', 57120);

console.log('Sending test OSC message...');
client.send('/test', 1, 2, 3, () => {
    console.log('Test message sent');
    client.close();
});