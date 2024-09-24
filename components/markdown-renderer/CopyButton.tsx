'use client';

import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/lib/utils';

interface CopyButtonProps {
  textToCopy: string;
  unclickedText?: string;
  clickedText?: string;
}

function CopyButton({ textToCopy, unclickedText = 'Copy', clickedText = 'Copied!' }: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 750 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard?.(textToCopy);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isCopied}>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="hover:bg-none text-gray-400" onClick={onCopy}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy code</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isCopied ? clickedText : unclickedText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CopyButton;
