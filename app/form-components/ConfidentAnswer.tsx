'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { ChevronDown, UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';
import MarkdownRenderer from '@/components/markdown-renderer/MarkdownRenderer';
import { AIMessageHeader } from './AIMessageHeader';
import LinkButtons from './LinkButtons';

interface ConfidentAnswerProps {
  links: z.infer<typeof ProvideLinksToolSchema>['links'];
  answer: string;
  showEscalationForm: ({ caption }: { caption: React.ReactNode }) => void;
  showEscalation: boolean;
}

export default function ConfidentAnswer({ links, answer, showEscalationForm, showEscalation }: ConfidentAnswerProps) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (showEscalation) {
      setOpen(false);
    }
  }, [showEscalation]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="space-y-6 animate-fade-in text-sm">
        <Separator className="my-6" />
        {/* collapsible trigger */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between w-full space-x-2 cursor-pointer">
            <AIMessageHeader />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down space-y-6">
          {links && links.length > 0 && (
            <>
              <p className="text-gray-700">I was able to find some help content:</p>
              <LinkButtons links={links} />
            </>
          )}
          <MarkdownRenderer markdown={answer} />
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
