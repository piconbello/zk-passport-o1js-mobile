import ExportButton from '@/components/ExportButton';
import { useNodeJSCommunication, useSocketDataForUUID, sendProofResponseForUUID, useSocketPublishDNS } from '@/helpers/nodejsWorker';
import { useProofRequest } from '@/hooks/useProofRequest';
import useRefMemo from '@/hooks/useRefMemo';
import tw from '@/tw';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useCallback, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { ProofRequest, ProofResponse, ProofResponseData, ProofResponseDataOptions } from '@/helpers/zkPassportSDK';

type ProofResponseCardProps = { proofResponse: ProofResponse };
function ProofResponseCard({ proofResponse }: ProofResponseCardProps) {

  useSocketPublishDNS(proofResponse.uuid);

  const connectedSockets = useSocketDataForUUID(proofResponse.uuid);

  const [sent, setSent] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const sendProof = useCallback(() => {
    if (sending) return;
    setSending(true);
    sendProofResponseForUUID(proofResponse.toEncryptedBuffer(), proofResponse.uuid)
     .then((success) => {
        setSent(success);
        setSending(false);
      })
  }, [proofResponse, sending]);

  return (
    <Card>
      <Card.Title 
        title={proofResponse.uuid} 
        subtitle={moment(proofResponse.timestamp).format('lll')}
      />
      <Card.Content>
        <Text variant="bodySmall" style={tw`font-mono px-2 pb-4`}>
          {JSON.stringify(proofResponse, null, 2)}
        </Text>
        {connectedSockets.map((socket) => (
          <Text style={tw`font-mono px-2 pb-4`}>
            {JSON.stringify(socket, null, 2)}
          </Text>
        ))}
      </Card.Content>
      <Card.Actions>
        <Button 
          onPress={sendProof} 
          loading={sending} 
          disabled={sent || sending || connectedSockets.length === 0}
        >
          { sent ? 'Proof is Sent' : 'Send Proof' }
        </Button>
      </Card.Actions>
    </Card>
  )
}


type ProofRequestCardProps = { proofRequest: ProofRequest };
function ProofRequestCard({ proofRequest }: ProofRequestCardProps) {
  return (
    <Card>
      <Card.Title 
        title={proofRequest.uuid} 
        subtitle={moment(proofRequest.timestamp).format('lll')}
      />
      <Card.Content>
        <Text variant="bodySmall" style={tw`font-mono px-2 pb-4`}>
          {JSON.stringify(proofRequest, null, 2)}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button>
          Some Button
        </Button>
      </Card.Actions>
    </Card>
  )
}

export default function Page() {
  const { proofRequestToken } = useLocalSearchParams();
  const proofRequest = useProofRequest(proofRequestToken as string);

  const proofResponse = useRefMemo<ProofResponse|null>(() => {
    if (!proofRequest) return null;
    let data: ProofResponseDataOptions;
    switch(proofRequest.query.type) {
      case 'dummy':
        data = { type: 'dummy', dummy: Math.floor(Math.random()*10000).toString(16) };
        break;
      default:
        throw new Error(`Unsupported proof request type: ${proofRequest.query.type}`);
    }
    return new ProofResponse({ proofRequest, data });
  }, [proofRequest]);

  return (
    <>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        <Text>New Proof Request</Text>
        <ScrollView horizontal={true} contentContainerStyle={tw`pb-12`}>
          <Text variant="bodySmall">{proofRequestToken}</Text>
        </ScrollView>
        { proofRequest ? (
          <ProofRequestCard proofRequest={proofRequest} />
        ) : (
          <Text>Invalid Proof Request Token</Text>
        )}
        { proofResponse ? (
          <ProofResponseCard
            proofResponse={proofResponse} 
          />
        ) : null }
      </ScrollView>
      <ExportButton
        proofRequestToken={proofRequestToken}
        proofRequest={proofRequest}
        proofResponse={proofResponse}
      />
    </>
  )
}


