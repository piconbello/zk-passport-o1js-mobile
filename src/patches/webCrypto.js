const { install } = require('react-native-quick-crypto');

console.log('React Native Quick Crypto: Installing Cryptographic libraries...');

install();

const { NKeyPrivate } = require('zk-passport-o1js-sdk');

const nkey = new NKeyPrivate();