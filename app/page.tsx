import { AI } from './ai/IntelligentFormAIConfig';
import IntelligentForm from './form-components/IntelligentForm';
import { DemoBanner } from '@/components/DemoBanner';
import type { Metadata } from 'next';

export const maxDuration = 300;

// Add metadata to set the page title
export const metadata: Metadata = {
  title: 'Support Ticket Submission | Help Center',
  description: 'Submit a support ticket to get help with your questions or issues',
};

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
