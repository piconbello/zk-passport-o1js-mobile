import ExportButton from '@/components/ExportButton';
import { ProofRequestIntent } from '@/helpers/proofRequest';
import useProofRequestIntent from '@/hooks/useProofRequestIntent';
import tw from '@/tw';
import { useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { ScrollView } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';


type ProofRequestCardProps = { proofRequestIntent: ProofRequestIntent };
function ProofRequestCard({ proofRequestIntent }: ProofRequestCardProps) {
  return (
    <Card>
      <Card.Title 
        title={proofRequestIntent.randomId} 
        subtitle={moment(proofRequestIntent.timestamp).format('lll')}
      />
      <Card.Content>
        <Text variant="bodySmall" style={tw`font-mono px-2 pb-4`}>
          {JSON.stringify(proofRequestIntent.proofRequest)}
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
  const proofRequestIntent = useProofRequestIntent(proofRequestToken as string);

  return (
    <>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        <Text>New Proof Request</Text>
        <ScrollView horizontal={true} contentContainerStyle={tw`pb-12`}>
          <Text variant="bodySmall">{proofRequestToken}</Text>
        </ScrollView>
        { proofRequestIntent ? (
          <ProofRequestCard proofRequestIntent={proofRequestIntent} />
        ) : (
          <Text>Invalid Proof Request Token</Text>
        )}
      </ScrollView>
      <ExportButton
        proofRequestToken={proofRequestToken}
        proofRequestIntent={proofRequestIntent}
      />
    </>
  )
}


