import { ProofRequest } from 'zk-passport-o1js-sdk';
import useRefMemo from "./useRefMemo"

export const useProofRequest = (proofRequestToken: string): ProofRequest|null => {
  return useRefMemo<ProofRequest|null>(
    () => {
      try {
        return ProofRequest.fromQRFriendlyString(proofRequestToken)
      } catch (error) {
        console.log('Failed to parse proof request token: ', error);
        return null;
      }
    },
    [proofRequestToken]
  );
}