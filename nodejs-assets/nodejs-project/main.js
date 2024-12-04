// entrance file from mobile app.

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// require('module-alias/register');
const rn_bridge = require('rn-bridge');
const customLog = (...args) => {
  console.log(...args);
  rn_bridge.channel.post('message', ...args);
}
global.customLog = customLog;
process.on('uncaughtException', (err) => {
  customLog('uncaughtException', err.message, err.stack);
})
rn_bridge.channel.on('message', (...args) => {
  console.log('LOG FROM RN_BRIDGE', ...args);
});
customLog('RN BRIDGE IS INITIALIZED');

// customLog('Node env is', process.env.NODE_ENV);

// customLog('__dirname is', __dirname);

const { ZkPassportLifecycle } = require('./lifecycle');

const lifecycle = new ZkPassportLifecycle(customLog);

const gracefulExitHandler = async (signal) => {
  try {
    customLog(`gracefulExitHandler started due to signal ${signal}`);
  } catch (e) {}
  try {
    await lifecycle.destructor();
    customLog(`gracefulExitHandler finished.`);
  } catch (e) {}
  process.exit(128+signal);
}

process.on('SIGINT', gracefulExitHandler)
process.on('SIGTERM', gracefulExitHandler)
process.on('SIGQUIT', gracefulExitHandler)

rn_bridge.channel.on('startLifecycle', () => {
  lifecycle.start()
   .then(() => {
    customLog('Lifecycle started successfully')
    rn_bridge.channel.post('startLifecycle', true);
   }).catch((err) => {
    customLog(`Lifecycle failed to start: ${err.message}`);
    rn_bridge.channel.post('startLifecycle', false);
   });
})

rn_bridge.channel.on('stopLifecycle', () => {
  lifecycle.stop()
   .then(() => {
    customLog('Lifecycle stopped successfully')
    rn_bridge.channel.post('stopLifecycle', true);
   }).catch((err) => {
    customLog(`Lifecycle failed to stop: ${err.message}`);
    rn_bridge.channel.post('stopLifecycle', false);
   });
})

rn_bridge.channel.on('socketDataInRoom', (room) => {
  lifecycle.requestSocketDataInRoom(room)
    .then((res) => {
      rn_bridge.channel.post('socketDataInRoom', res);
    }).catch((err) => {
      customLog(`Error fetching socket data in room ${room}: ${err.message}`);
    });
})

rn_bridge.channel.on('sendProofDataToRoom', (uuid, room, proofData) => {
  lifecycle.sendProofDataToRoom(room, proofData)
   .then((res) => {
      rn_bridge.channel.post('sendProofDataToRoom', uuid, res);
    }).catch((err) => {
      customLog(`Error sending proof data to room ${room}: ${err.message}`);
      rn_bridge.channel.post('sendProofDataToRoom', uuid, false);
    });
});

lifecycle.start()
  .then(() => customLog('Lifecycle started successfully'));
