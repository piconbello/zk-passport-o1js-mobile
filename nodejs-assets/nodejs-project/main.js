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
    customLog(`\ngracefulExitHandler started due to signal ${signal}`);
  } catch (e) {}
  try {
    await lifecycle.destructor();
    customLog(`gracefulExitHandler finished.`);
  } catch (e) {
    customLog(`gracefulExitHandler error: ${e.message}`);
  }
  process.exit(128+signal);
}

process.on('SIGINT', gracefulExitHandler)
process.on('SIGTERM', gracefulExitHandler)
process.on('SIGQUIT', gracefulExitHandler)

rn_bridge.app.on('pause', (pauseLock) => {
  lifecycle.stop()
    .then(() => {
      customLog('Lifecycle stopped due to app pause');
    }).catch((err) => {
      customLog(`Failed to stop lifecycle (app pause): ${err.message}`);
    }).finally(() => {
      pauseLock.release();
    });
});

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

rn_bridge.channel.on('publishDNS', (id) => {
  lifecycle.publishDNS(id)
});

rn_bridge.channel.on('unpublishDNS', (id) => {
  lifecycle.unpublishDNS(id)
});

rn_bridge.channel.on('socketDataInRoom', (room) => {
  lifecycle.requestSocketDataInRoom(room)
    .then((res) => {
      rn_bridge.channel.post('socketDataInRoom', room, res);
    }).catch((err) => {
      customLog(`Error fetching socket data in room ${room}: ${err.message}`);
    });
})

rn_bridge.channel.on('proofResponseToRoom', (uuid, room, proofResponseHex) => {
  lifecycle.sendProofResponseToRoom(room, proofResponseHex)
   .then(() => {
      rn_bridge.channel.post('proofResponseToRoom', uuid, true);
    }).catch((err) => {
      customLog(`Error sending proof data to room ${room}: ${err.message}`);
      rn_bridge.channel.post('proofResponseToRoom', uuid, false);
    });
});