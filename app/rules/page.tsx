import RulesPageClient from './RulesPageClient';
import { getContentByType } from '@/lib/markdown';

export const metadata = {
  title: 'SagaBorn D100 SRD',
  description: 'The complete System Reference Document for SagaBorn D100, a streamlined fantasy RPG.',
};

export default function RulesPage() {
  // Load content on the server
  const spells = getContentByType('spells');
  const creatures = getContentByType('creatures');
  const tools = getContentByType('tools');

  return (
    <RulesPageClient 
      initialSpells={spells}
      initialCreatures={creatures}
      initialTools={tools}
    />
  );
}