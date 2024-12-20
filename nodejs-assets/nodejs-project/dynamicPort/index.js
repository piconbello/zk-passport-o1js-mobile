class DynamicPortListenHelper {
  constructor(makeLog, server) {
    this._makeLog = makeLog;
    // https://stackoverflow.com/questions/10476987/best-tcp-port-number-range-for-internal-applications
    // We use 38866 - 39680
    this._server = server;
    // this._dynamicPortRangeStart = 38866;
    // this._nofPotentialPorts = 39680 - 38866;
    this._dynamicPortRangeStart = 38959; // randomly chosen to start from this one.
    this._nofPotentialPorts = 10; // allow up to 10 ports for absurd reliability :)
    this._initialPortIndex = 0;
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