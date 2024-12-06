const socketIO = require('socket.io');
const msgpack = require('notepack.io');
const customSocketIOParser = require('socket.io-msgpack-parser');

const { NKey } = require('../nkey');

const socketIOServerOptions = {
  path: '/socket.io',
  transports: [ "websocket" ],
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    credentials: true
  },
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
      parser: customSocketIOParser,
      // withCredentials: true
    });
    this._io.use(this._authMiddleware);
  }

  setServerName(serverName) {
    this._serverName = serverName;
  }

  _authenticateSDK(tokenParts) {
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
    if (serverName!== this._serverName) {
      console.log('servername', serverName, this._serverName);
      throw new Error('Invalid server name');
    }
    const id = Buffer.from(publicKey).toString('hex');
    this._makeLog(`An SDK (#${id}) connected from c:${clientName} ~ ${clientOrigin}`);
    const details = { clientName, clientOrigin };
    return ['SDK', id, details];
  }

  _authenticateToken(token) {
    if (!token) throw new Error('No token provided');
    switch(token[0].toUpperCase()) {
      case 'SDK':
        return this._authenticateSDK(token.slice(1));
      default:
        throw new Error(`Unknown auth method ${token[0]}`);
    }
  }

  _authMiddleware(socket, next) {
    const token = socket?.handshake?.auth?.token;
    // console.log('token is', socket.handshake.auth);
    try {
      const [type, id, details] = this._authenticateToken(token);
      // socket.data.token = token;
      socket.data.type = type;
      socket.data.id = id;
      socket.data.details = details;
      socket.join(`/${type}`);
      socket.join(`/${type}/${id}`);
      return next();
    } catch (e) {
      this._makeLog(`Unauthorized socket connection due to ${e.message}`);
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

  async sendProofDataToRoom(room, proofData) {
    return new Promise((resolve, reject) => {
      this._io.timeout(60*1000).to(`${room}`).emit('proofData', proofData, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports.SocketIOServer = SocketIOServer;