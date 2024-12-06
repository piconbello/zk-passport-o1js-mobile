import { ProofRequestIntent } from "@/helpers/proofRequest"
import useRefMemo from "./useRefMemo"

const useProofRequestIntent = (proofRequestToken: string): ProofRequestIntent|null => {
  return useRefMemo<ProofRequestIntent|null>(
    () => ProofRequestIntent.fromRequestToken(proofRequestToken), 
    [proofRequestToken]
  );
}

export default useProofRequestIntent;