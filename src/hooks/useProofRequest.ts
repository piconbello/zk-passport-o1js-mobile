import { ProofRequest } from 'zk-passport-o1js-sdk';
import useRefMemo from "./useRefMemo"

export const useProofRequest = (proofRequestToken: string): ProofRequest|null => {
  return useRefMemo<ProofRequest|null>(
    () => {
      try {
        console.log('profy');
        return ProofRequest.fromQRFriendlyString(proofRequestToken)
      } catch (error) {
        console.log('Symbol.toStringTag', Symbol.toStringTag);
        console.log('Failed to parse proof request token: ', error, 'stack', (error as Error)?.stack);
        return null;
      }
    },
    [proofRequestToken]
  );
}