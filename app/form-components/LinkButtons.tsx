import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import { ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';

export default function LinkButtons({
  links,
}: {
  links: z.infer<typeof ProvideLinksToolSchema>['links'];
}) {
  return links ? (
    <div className="flex flex-wrap gap-2">
      {links.map((link, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="bg-gray-50 hover:bg-gray-100 text-[13px] text-gray-700"
          asChild
        >
          <a href={link.url} target="_blank" rel="noreferrer">
            <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
            {link.title}
          </a>
        </Button>
      ))}
    </div>
  ) : null;
}
