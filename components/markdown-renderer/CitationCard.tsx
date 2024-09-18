'use client';

import React from 'react';
import { LinkIcon } from 'lucide-react';

interface CitationCardProps {
  title?: string | null;
  url?: string | null;
  openInNewTab?: boolean;
}

function CitationCard({ title = '', url, openInNewTab = true }: CitationCardProps) {
  return (
    <a
      href={url || undefined}
      target={openInNewTab ? '_blank' : ''}
      rel="noreferrer"
      className="border-1 flex rounded-md border p-4 transition-colors duration-200 ease-in-out hover:bg-gray-50"
    >
      <div className="flex shrink-0 items-center justify-center pr-4">
        <LinkIcon className="text-muted-foreground h-4 w-4" />
      </div>
      <div className="flex min-w-0 max-w-full flex-col">
        <h3 className="truncate text-sm">{title}</h3>
      </div>
    </a>
  );
}

export default CitationCard;
