// entrance file from computer. use as node test.js proofRequestUUID

const { ZkPassportLifecycle } = require('./lifecycle');

const lifecycle = new ZkPassportLifecycle(console.log);

const gracefulExitHandler = async (signal) => {
  try {
    console.log(`gracefulExitHandler started due to signal ${signal}`);
  } catch (e) {}
  try {
    await lifecycle.destructor();
    console.log(`gracefulExitHandler finished.`);
  } catch (e) {}
  process.exit(128+signal);
}

process.on('SIGINT', gracefulExitHandler)
process.on('SIGTERM', gracefulExitHandler)
process.on('SIGQUIT', gracefulExitHandler)

lifecycle.start()
  .then(() => {
    console.log('Lifecycle started successfully');
    lifecycle.publishDNS(process.argv[2])
    console.log('Published DNS successfully', process.argv[2]);
  });

setInterval(() => {
  lifecycle.requestSocketDataInRoom('/SDK')
    .then((res) => console.log('Socket data in room /SDK:', res))
    .catch((err) => console.log(`Error fetching socket data in room /SDK: ${err.message}`));
}, 5000);