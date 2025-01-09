// IT MIGHT BE NICE TO REFACTOR THIS FILE SOMETIME IN THE FUTURE
const socketIO = require('socket.io');
const msgpack = require('msgpack-lite');
let BASE36;
import('@thi.ng/base-n').then(b => {
  BASE36 = b.BASE36; 
  // NOT THE BEST WAY OF IMPORTING, BUT WOULD WORK BC THERE ARE OTHER ASYNC OPS BEFORE IT IS USED.
})
// const customSocketIOParser = require('socket.io-msgpack-parser');

const { NKey } = require('../nkey');
const { bytesToHex, hexToBytes, equalBytes } = require('@noble/curves/abstract/utils');

const socketIOServerOptions = {
  path: '/socket.io',
  transports: [ "websocket" ],
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    credentials: true
  },
  // cors: true,
  /*origins: "*:*",*/
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
};

class SocketIOServer {
  constructor(makeLog) {
    this._makeLog = makeLog;
    this._authenticateSDK = this._authenticateSDK.bind(this);
    this._authMiddleware = this._authMiddleware.bind(this);
    this._io = new socketIO.Server({
      ...socketIOServerOptions,
      // parser: customSocketIOParser,
      // withCredentials: true
    });
    this._io.use(this._authMiddleware);
  }

  _authenticateSDK(tokenParts, hostname) {
    // this._makeLog('tokenparts', tokenParts);
    // this._makeLog('tokenpart instance of arraybuffer', tokenParts[0].constructor.name);
    console.log(new Uint8Array(tokenParts[0]));
    const publicKey = Buffer.from(tokenParts[0]);
    const payloadBuffer = Buffer.from(tokenParts[1]);
    const signature = Buffer.from(tokenParts[2]);

    // validate signature.
    if (!NKey.verify(signature, payloadBuffer, publicKey)) {
      throw new Error('Invalid signature');
    }
    const { timestamp, serverName, clientName, clientOrigin } = msgpack.decode(payloadBuffer);
    if (Date.now() - timestamp > 10 * 1000) {
      throw new Error('Token expired');
    }
    console.log('serverName', serverName);
    const proofRequestUUIDSize = Math.floor(
      serverName.length * Math.log(36) / Math.log(256)
    );
    const proofRequestUUIDBuffer = new Uint8Array(proofRequestUUIDSize);
    BASE36.decodeBytes(serverName.toUpperCase(), proofRequestUUIDBuffer);
    
    if (!equalBytes(proofRequestUUIDBuffer.subarray(0, publicKey.length), publicKey)) {
      throw new Error('Public key does not match server name');
    }
    if (!(hostname || '').includes(serverName)) {
      console.log('servername', serverName, 'host', hostname);
      throw new Error('Invalid host name');
    }
    const uuid = serverName;
    this._makeLog(`An SDK (#${uuid}) connected from c:${clientName} ~ ${clientOrigin}`);
    const details = { clientName, clientOrigin };
    return ['SDK', uuid, details];
  }

  _authenticateToken(token, hostname) {
    if (!token) throw new Error('No token provided');
    const [type, tokenData] = token.split(/\s+/g);
    const tokenParts = msgpack.decode(hexToBytes(tokenData))
    switch(type.toUpperCase()) {
      case 'SDK':
        return this._authenticateSDK(tokenParts, hostname);
      default:
        throw new Error(`Unknown auth method ${type}`);
    }
  }

  _authMiddleware(socket, next) {
    const token = socket?.handshake?.auth?.token;
    const hostname = socket?.request?.headers?.host;
    // console.log('token is', socket.handshake.auth);
    try {
      const [type, uuid, details] = this._authenticateToken(token, hostname);
      // socket.data.token = token;
      socket.data.type = type;
      socket.data.uuid = uuid;
      socket.data.details = details;
      socket.join(`/${type}`);
      socket.join(`/${type}/${uuid}`);
      return next();
    } catch (e) {
      this._makeLog(`Unauthorized socket connection due to ${e.message} ${e.stack}`);
      const error = new Error('Authentication failed');
      error.status = 401;
      return next(error);
    }
  }

  async destructor() {
    this._makeLog('Destructing SocketIOServer...');
    try {
      await new Promise((resolve, reject) => {
        this._io.close(err => {
          // it should also close http server.
          if (err) reject(err);
          resolve();
        });
      })
    } catch (err) {
      this._makeLog(`Error closing socket io server: ${err.message}`);
    }
  }

  attachServer(server) {
    this._io.attach(server);
  }
  
  async fetchSocketDataByRoom(room) {
    const sockets = await this._io.in(`${room}`).fetchSockets();
    return sockets.map(socket => socket.data);
  }

  async sendProofResponseToRoom(room, proofResponseHex) {
    const proofResponse = hexToBytes(proofResponseHex);
    return new Promise((resolve, reject) => {
      this._io.timeout(60*1000).to(`${room}`).emit('proofResponse', proofResponse, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports.SocketIOServer = SocketIOServer;