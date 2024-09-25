import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import type { ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';

export default function LinkButtons({
  links,
}: {
  links: z.infer<typeof ProvideLinksToolSchema>['links'];
}) {
  const uniqueLinks = links
    ? links.filter((link, index, self) => index === self.findIndex(t => t.url === link.url && t.title === link.title))
    : null;
  return uniqueLinks ? (
    <div className="flex flex-wrap gap-2">
      {uniqueLinks.map((link, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className=" hover:bg-gray-100 text-[13px] text-gray-700"
          asChild
        >
          <a href={link.url} target="_blank" rel="noreferrer">
            <LinkIcon className="h-[14px] w-[14px] mr-2 text-gray-400" />
            {link.title}
          </a>
        </Button>
      ))}
    </div>
  ) : null;
}
