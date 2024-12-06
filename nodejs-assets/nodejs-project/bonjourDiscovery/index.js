// use this for publishing bonjour service
const ciao = require("@homebridge/ciao");

const bonjourType = 'zk-pass-o1js';

class BonjourDiscovery {
  constructor(makeLog) {
    this._makeLog = makeLog;
    this._responder = ciao.getResponder();
    this._publishedServices = new Map();
    this._serializeServer = this._serializeServer.bind(this);
    this._handleServicePublished = this._handleServicePublished.bind(this);
    this._handleServiceError = this._handleServiceError.bind(this);
    this._destroyService = this._destroyService.bind(this);
    this._announceService = this._announceService.bind(this);
    this.publish = this.publish.bind(this);
  }

  async destructor() {
    this._makeLog('Destructing BonjourDiscovery...');
    await Promise.all([
      Array.from(this._publishedServices.entries()).map(
        ([serializedServer, service]) => 
          service.end().then(
              () => this._makeLog(`Ended ${serializedServer} service`)
            ).catch(
              err => this._makeLog(`Error ending service: ${err.message}`)
            )
      )
    ])
    try {
      await this._responder.shutdown();
    } catch (err) {
      this._makeLog(`Error shutting down Bonjour responder: ${err.message}`);
    }
  }

  _serializeServer(port, name) {
    return `${port}~${name}`;
  }

  _handleServicePublished(serializedServer) {
    this._makeLog(`Published ${serializedServer}`);
  }

  _handleServiceError(serializedServer, error) {
    this._makeLog(`Failed to publish ${serializedServer}, will retry in 60 seconds: ${error.message}`);
    setTimeout(this._announceService, 60 * 1000, serializedServer);
  }

  _announceService(serializedServer){
    if (this._publishedServices.has(serializedServer)) {
      this._publishedServices.get(serializedServer).advertise()
        .then(() => this._handleServicePublished(serializedServer))
        .catch((err) => this._handleServiceError(serializedServer, err));
    }
  }

  async _destroyService(serializedServer, service) {
    try {
      await service.destroy();
      this._makeLog(`Unpublished ${serializedServer}`);
    } catch (error) {
      this._makeLog(`Failed to unpublish ${serializedServer}, will retry in 60 seconds: ${error.message}`);
      setTimeout(this._destroyService, 60 * 1000, serializedServer, service);
    }
  }

  publish(port, name) {
    const serializedServer = this._serializeServer(port, name);
    if (this._publishedServices.has(serializedServer)) {
      this._makeLog(`Already published ${serializedServer}`);
      return;
    }
    const opts = {
      name: name,
      type: bonjourType,
      port: port,
      protocol: ciao.Protocol.TCP,
    };
    const service = this._responder.createService(opts);
    this._publishedServices.set(serializedServer, service);
    this._announceService(serializedServer);
  }

  unpublish(port, name) {
    const serializedServer = this._serializeServer(port, name);
    if (this._publishedServices.has(serializedServer)) {
      const service = this._publishedServices.get(serializedServer);
      this._publishedServices.delete(serializedServer);
      this._destroyService(serializedServer, service);
    }
  }
}

module.exports.BonjourDiscovery = BonjourDiscovery;