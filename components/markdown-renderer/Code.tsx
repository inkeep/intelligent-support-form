import { cn } from '@/lib/utils';
import React from 'react';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

const Code = React.forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <pre
    className="inline-block"
    style={{
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    }}
  >
    <code
      ref={ref}
      className={cn(
        'bg-gray-100 rounded-md py-1 px-2 my-0.5 text-[13px] text-gray-700 font-medium min-w-0 inline-block border',
        className,
      )}
      style={{
        overflowWrap: 'anywhere', // no tailwind util class at this time
      }}
      {...props}
    />
  </pre>
));

Code.displayName = 'Code';

export default Code;
