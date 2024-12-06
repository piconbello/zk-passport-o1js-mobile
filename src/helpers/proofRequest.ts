import { BASE36, BASE64 } from '@thi.ng/base-n';
import * as msgpack from 'notepack.io';
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, bytesToNumberBE } from '@noble/curves/abstract/utils';

export interface ProofRequestObject {
  readonly dummy?: string; // TODO define proofRequest object fields here
}

export class ProofRequest {
  readonly dummy?: string;

  constructor(partialProofRequestObject?: Partial<ProofRequestObject>) {
    this.dummy = partialProofRequestObject?.dummy?? undefined;
    if (typeof this.dummy !== 'undefined' && typeof this.dummy!=='string') {
      throw new Error('dummy field must be a string');
    }
  }

  public static fromCompactBuffer(buffer: Uint8Array): ProofRequest {
    const proofRequestObject = msgpack.decode(buffer);
    return new ProofRequest(proofRequestObject);
  }
}

export interface ProofRequestIntentObject {
  proofRequestToken: string;
  isValid: boolean;
  isVerified: boolean;
  ed25519pub: Uint8Array;
  signature: Uint8Array;
  randomId: Uint8Array;
  timestamp: number;
  proofRequest: ProofRequest;
  uuid: string;
}

export class ProofRequestIntent implements ProofRequestIntentObject {
  public readonly proofRequestToken: string;
  public readonly isValid: boolean;
  public readonly isVerified: boolean;
  public readonly ed25519pub: Uint8Array;
  public readonly signature: Uint8Array;
  public readonly randomId: Uint8Array;
  public readonly timestamp: number;
  public readonly proofRequest: ProofRequest;
  public readonly uuid: string;

  constructor(proofRequestIntentObject: ProofRequestIntentObject) {
    this.proofRequestToken = proofRequestIntentObject.proofRequestToken;
    this.isValid = proofRequestIntentObject.isValid;
    this.isVerified = proofRequestIntentObject.isVerified;
    this.ed25519pub = proofRequestIntentObject.ed25519pub;
    this.signature = proofRequestIntentObject.signature;
    this.randomId = proofRequestIntentObject.randomId;
    this.timestamp = proofRequestIntentObject.timestamp;
    this.proofRequest = proofRequestIntentObject.proofRequest;
    this.uuid = proofRequestIntentObject.uuid;
  }

  static fromRequestToken(proofRequestToken: string): ProofRequestIntent|null {
    const obj: Partial<ProofRequestIntentObject> & { proofRequestToken: string } = { proofRequestToken };
    let intentBufer: Uint8Array;
    // DECODE TOKEN
    try {
      const [ed25519pubBase36, intentBufferBase36, signatureBase36] = obj.proofRequestToken.split('-');
      obj.ed25519pub = new Uint8Array(32);
      obj.signature = new Uint8Array(64);
      intentBufer = new Uint8Array(
        Math.floor(
          intentBufferBase36.length * Math.log(36) / Math.log(256)
        )
      );
      BASE36.decodeBytes(ed25519pubBase36, obj.ed25519pub);
      BASE36.decodeBytes(signatureBase36, obj.signature);
      BASE36.decodeBytes(intentBufferBase36, intentBufer);
      obj.randomId = intentBufer.subarray(0, 10);
      obj.timestamp = Number(bytesToNumberBE(intentBufer.subarray(10, 16)));
      obj.uuid = `${BASE64.encodeBytes(obj.randomId)}~${BASE64.encode(obj.timestamp)}`;
      obj.proofRequest = ProofRequest.fromCompactBuffer(intentBufer.subarray(16));
      obj.isValid = true;
      // VERIFY TOKEN
      try {
        const verified = ed25519.verify(obj.signature, intentBufer, obj.ed25519pub);
        if (!verified) {
          throw new Error('Verify failed');
        }
        obj.isVerified = true;
      } catch (error) {
        obj.isVerified = false;
        console.error('Invalid proof request token signature:', error);
      } finally {
        return new ProofRequestIntent(obj as ProofRequestIntentObject);
      }
    } catch (error) {
      console.error('Invalid proof request token:', error);
      return null;
    }
  }
}
