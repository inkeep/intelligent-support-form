'use client';

import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import MarkdownRenderer from '@/components/markdown-renderer/MarkdownRenderer';
import { AIMessageHeader } from './AIMessageHeader';
import LinkButtons from './LinkButtons';

export default function ConfidentAnswer({
  links,
  answer,
  showEscalationForm,
}: {
  links: z.infer<typeof ProvideLinksToolSchema>['links'];
  answer: string;
  showEscalationForm: ({ caption }: { caption: React.ReactNode }) => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in text-sm">
      <Separator className="my-6" />
      <AIMessageHeader />
      {links && links.length > 0 && (
        <>
          <p className="text-gray-700">I was able to find some help content:</p>
          <LinkButtons links={links} />
        </>
      )}

      <p className="text-gray-700">{"Here's a suggested answer:"}</p>
      <Card className="shadow-none">
        <CardContent className="p-4">
          <MarkdownRenderer markdown={answer} />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            showEscalationForm({
              caption: (
                <>
                  <AIMessageHeader />
                  <p className="text-gray-600 text-sm">Understood. Please confirm the below information:</p>
                </>
              ),
            });
          }}
          className="flex items-center"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Escalate to human
        </Button>
      </div>
    </div>
  );
}
