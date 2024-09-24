import type { PropsWithChildren } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Code from './Code';
import CodeBlock from './CodeBlock';
import CodeBlockHeader from './CodeBlockHeader';

interface CodeElementProps extends PropsWithChildren {
  inline?: boolean;
  className?: string;
}

function CodeElement({ inline: inlineProp, className = '', children }: CodeElementProps) {
  const language = className.replace(/^language-/, '');
  const codeString = String(children).replace(/\n$/, '');
  const inline = inlineProp || !codeString.includes('\n');

  if (!inline) {
    return (
      <div className="dark:gray-dark-800 mb-3 rounded-md bg-gray-50 max-w-full">
        <CodeBlockHeader codeString={codeString} language={language} />
        <ScrollArea>
          <div>
            <CodeBlock codeString={codeString} language={language} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }
  return <Code>{children}</Code>;
}

export default CodeElement;
