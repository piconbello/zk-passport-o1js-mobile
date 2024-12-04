class DynamicPortListenHelper {
  constructor(makeLog, server) {
    this._makeLog = makeLog;
    // TRY TO FIND AN AVAILABLE PORT FROM THE DYNAMIC RANGE (49152-65535)
    this._server = server;
    this._dynamicPortRangeStart = (3<<14);
    this._nofPotentialPorts = (1<<14);
    this._initialPortIndex = ~~(Math.random() * this._nofPotentialPorts);
  }
  async listen(callback) {
    let portIndex = this._initialPortIndex;
    do {
      let port = portIndex + this._dynamicPortRangeStart;
      // this._makeLog(`Trying to listen on port ${port}`);
      try {
        await new Promise((resolve, reject) => {
          this._server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              reject(err);
            } else {
              this._makeLog(`Server sent an unexpected error when trying to listen port ${port}`, err);
              reject(err);
            }
          });
          this._server.listen(port, resolve);
        })
        callback && callback(port);
        return port;
      } catch (e) {}
      portIndex = (portIndex + 1) % this._nofPotentialPorts;
    } while (portIndex !== this._initialPortIndex)
    throw new Error('Failed to find an available port within the dynamic range');
  }
}

module.exports.DynamicPortListenHelper = DynamicPortListenHelper;