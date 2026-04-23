/**
 * WebSocket Service — Real-time GPS relay (Driver → Customer)
 * Drivers push location updates; customers subscribe to their order's driver.
 */

const WebSocket = require('ws');
const { updateDriverLocation } = require('./driverMatching');

let wss;

// Map: driverId → Set of customer WebSocket clients subscribed to that driver
const driverSubscribers = new Map();
// Map: ws → { type, id }
const clientMeta = new Map();

function initWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw);
        await handleMessage(ws, msg);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    });

    ws.on('close', () => cleanup(ws));
  });

  console.log('✅ WebSocket server ready');
}

async function handleMessage(ws, msg) {
  switch (msg.type) {

    // Driver: register and start sending location
    case 'driver:register': {
      clientMeta.set(ws, { type: 'driver', id: msg.driverId });
      ws.send(JSON.stringify({ type: 'driver:registered' }));
      break;
    }

    // Driver: push GPS update
    case 'driver:location': {
      const { driverId, lat, lng } = msg;
      await updateDriverLocation(driverId, lat, lng);

      // Relay to all subscribed customers
      const subs = driverSubscribers.get(driverId);
      if (subs) {
        const payload = JSON.stringify({ type: 'location:update', driverId, lat, lng, ts: Date.now() });
        subs.forEach((sub) => {
          if (sub.readyState === WebSocket.OPEN) sub.send(payload);
        });
      }
      break;
    }

    // Customer: subscribe to track a specific driver's order
    case 'customer:subscribe': {
      const { driverId, customerId } = msg;
      clientMeta.set(ws, { type: 'customer', id: customerId });
      if (!driverSubscribers.has(driverId)) driverSubscribers.set(driverId, new Set());
      driverSubscribers.get(driverId).add(ws);
      ws.send(JSON.stringify({ type: 'customer:subscribed', driverId }));
      break;
    }

    default:
      ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msg.type}` }));
  }
}

function cleanup(ws) {
  const meta = clientMeta.get(ws);
  if (meta?.type === 'customer') {
    driverSubscribers.forEach((subs) => subs.delete(ws));
  }
  clientMeta.delete(ws);
}

module.exports = { initWebSocket };
