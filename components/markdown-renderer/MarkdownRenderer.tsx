/* eslint-disable react/no-unstable-nested-components */

'use client';

import React from 'react';
import type { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import CodeElement from './CodeElement';
import MemoizedReactMarkdown from './MemoizedReactMarkdown';
import CitationLink from './CitationLink';
import Code from './Code';
import { nanoid } from '@/lib/utils';
import { Element } from 'hast';

const disallowedElements = ['script', 'iframe', 'frame', 'embed', 'meta', 'base', 'form', 'style', 'object'];

type pChildPropType = {
  children: string;
  node: Element;
};

interface MarkdownRendererProps {
  markdown: string;
}

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children }) => <h1 className="text-md">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm">{children}</h2>,
    p: ({ children, node }) => {
      const isLastElement = node?.position?.end?.offset === markdown.length;
      return (
        <p className={`break-words ${isLastElement ? '' : 'mb-3'}`}>
          {
            Array.isArray(children)
              ? children.map(child => {
                if (React.isValidElement(child)) {
                  const childProps = child.props as pChildPropType;
                  if (childProps.node?.tagName === 'code') {
                    return <Code key={nanoid()}>{childProps.children}</Code>;
                  }
                }
                return <React.Fragment key={nanoid()}>{child}</React.Fragment>;
              })
              : children
            // commenting this out for now, caused a bug where bold list items where rendered as [object Object]
            // String(children)
            //   .split('\\n')
            //   .map(line => <React.Fragment key={nanoid()}>{line}</React.Fragment>)
          }
        </p>
      );
    },
    ol: ({ children }) => (
      <ol className="[p]:inline relative list-decimal break-words pb-3 pl-7 [&>a]:inline [&>a]:break-words [&>li]:mb-1">
        {children}
      </ol>
    ),
    ul: ({ children }) => (
      <ul className="relative list-inside list-disc break-words pb-3 [&:li]:before:mr-2 [&>a]:inline [&>a]:break-words [&>li]:mb-1 [&>p]:inline">
        {children}
      </ul>
    ),
    li: ({ children }) => <li className="break-words [&>p]:inline">{children}</li>,
    a: ({ children, ...props }) => <CitationLink {...props}>{children}</CitationLink>,
    code: ({ children, ...props }) => <CodeElement {...props}>{children}</CodeElement>,
    blockquote: ({ children }) => <blockquote className="border-l-2 pl-4">{children}</blockquote>,
  };

  return (
    <div className="min-w-0 max-w-full shrink break-words text-sm">
      <MemoizedReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={components}
        disallowedElements={disallowedElements}
      >
        {markdown}
      </MemoizedReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
