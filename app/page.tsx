import { AI } from './ai/IntelligentFormAIConfig';
import IntelligentForm from './form-components/IntelligentForm';
import { DemoBanner } from '@/components/DemoBanner';

export const maxDuration = 300;

export default function Home() {
  return (
    <AI>
      <div className="h-full flex min-h-0 flex-col">
        <DemoBanner />
        <IntelligentForm />
      </div>
    </AI>
  );
}
