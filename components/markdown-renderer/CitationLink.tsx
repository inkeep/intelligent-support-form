import React from 'react';

interface CitationLinkProps {
  children: React.ReactNode;
  href?: string;
}

// citations are returned as a string like "(1)"

function CitationLink({ children, href, ...props }: CitationLinkProps) {
  const childArray = React.Children.toArray(children);
  const child = childArray[0];
  const isCitation = typeof child === 'string' && /^\(\d+\)$/.test(child) && childArray.length === 1;

  if (isCitation) {
    const citationNumber = child.match(/\d+/); // extract the number
    return (
      <sup className="ml-1 cursor-pointer">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer font-bold text-[0.625rem] leading-[0.75rem] px-[4px] py-[2px] rounded-sm bg-zinc-200 no-underline dark:text-primary-foreground"
          href={href}
        >
          {citationNumber}
        </a>
      </sup>
    );
  }
  return (
    <a
      className="font-medium border-b border-b-primaryExpanded-400"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

export default CitationLink;
