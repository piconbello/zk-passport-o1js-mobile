// main application
const http = require('node:http');
const { randomBytes } = require('node:crypto');
const { DynamicPortListenHelper } = require('../dynamicPort');
const { SocketIOServer } = require('../socketIOServer');
const { BonjourDiscovery } = require('../bonjourDiscovery');

class ZkPassportLifecycle {
  constructor(makeLog) {
    this._makeLog = makeLog;
    this._server = http.createServer();
    this._port = null;
    this._socketIOServer = new SocketIOServer(this._makeLog);
    this._socketIOServer.attachServer(this._server);
    this._bonjourDiscovery = new BonjourDiscovery(this._makeLog);
  }

  async start() {
    const dynamicPort = new DynamicPortListenHelper(this._makeLog, this._server);
    this._port = await dynamicPort.listen();
    this._makeLog(`Server started on port ${this._port}`);
  }

  publishDNS(id) {
    this._makeLog(`Published ${id}.local:${this._port}`);
    this._bonjourDiscovery.publish(this._port, id);
  }

  unpublishDNS(id) {
    this._bonjourDiscovery.unpublish(this._port, id);
  }

  async stop() {
    this._bonjourDiscovery.unpublishAll();
    this._server.close();
  }

  async destructor() {
    this._makeLog('Destructing ZkPassportLifecycle...');
    await this._bonjourDiscovery.destructor();
    await this._socketIOServer.destructor();
  }

  async requestSocketDataInRoom(room) {
    return this._socketIOServer.fetchSocketDataByRoom(room);
  }

  async sendProofDataToRoom(room, proofData) {
    try {
      await this._socketIOServer.sendProofDataToRoom(room, proofData);
      return true;
    } catch (err) {
      this._makeLog(`Error sending proof data to room ${room}: ${err.message}`);
      return false;
    }
  }
}

module.exports.ZkPassportLifecycle = ZkPassportLifecycle;