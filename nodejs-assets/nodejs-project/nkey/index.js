const { ed25519, x25519, edwardsToMontgomeryPub, edwardsToMontgomeryPriv } = require('@noble/curves/ed25519');
const { equalBytes } = require('@noble/curves/abstract/utils');

class NKey {
  constructor(keyData) {
    this.ed25519priv = (keyData instanceof NKey) ? keyData.ed25519priv : (keyData ?? ed25519.utils.randomPrivateKey());
    if (!this.ed25519priv instanceof Uint8Array || this.ed25519priv.length!== 32) {
      throw new Error('Invalid Ed25519 private key');
    }
    this.ed25519pub = ed25519.getPublicKey(this.ed25519priv);
    this.x25519priv = edwardsToMontgomeryPriv(this.ed25519priv);
    this.x25519pub = edwardsToMontgomeryPub(this.ed25519pub);
    if (!equalBytes(
      x25519.getPublicKey(this.x25519priv),
      this.ed25519pub
    )) {
      throw new Error('Invalid X25519 key pair');
    }
    this.getSharedSecret = this.getSharedSecret.bind(this);
  }
  static verify(signature, data, publicKey) {
    // console.log('signature', signature.length, 'publicKey', publicKey.length, 'data', data.length);
    if (signature.length!== 64 || publicKey.length!== 32) {
      throw new Error('Invalid signature/public key');
    }
    return ed25519.verify(signature, data, publicKey);
  }
  sign(data) {
    return ed25519.sign(data, this.ed25519priv);
  }
  getSharedSecret(otherEd25519pub) {
    if (otherEd25519pub.length !== 32) {
      throw new Error('Invalid public key');
    }
    const otherX25519pub = edwardsToMontgomeryPub(otherEd25519pub);
    const sharedSecret = x25519.getSharedSecret(this.x25519priv, otherX25519pub);
    return sharedSecret;
  }
}

module.exports.NKey = NKey;