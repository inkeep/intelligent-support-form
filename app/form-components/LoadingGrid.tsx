'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

interface LoadingDotProps extends React.HTMLAttributes<HTMLDivElement> {}

const LoadingDot = React.forwardRef<HTMLDivElement, LoadingDotProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('w-1 h-1 rounded-full bg-muted', className)} {...props} />
));

LoadingDot.displayName = 'LoadingDot';

const opacity = ['opacity-25', 'opacity-50', 'opacity-100'];

export function LoadingGrid() {
  const [dots, setDots] = useState([1, 2, 0, 0, 0, 0, 0, 0]);

  const intervalTime = 100;

  useEffect(() => {
    const sequence = [
      [1, 2, 0, 0, 0, 0],
      [0, 1, 0, 2, 0, 0],
      [0, 0, 0, 1, 0, 2],
      [0, 0, 0, 0, 2, 1],
      [0, 0, 2, 0, 1, 0],
      [2, 0, 1, 0, 0, 0],
    ];
    let sequenceIndex = 0;

    const intervalId = setInterval(() => {
      setDots(sequence[sequenceIndex]);
      sequenceIndex += 1;
      if (sequenceIndex >= sequence.length) sequenceIndex = 0;
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-12 items-center justify-center">
      <div className="grid grid-cols-3 gap-3">
        {dots.map((dot, index) => (
          <LoadingDot
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={`dark:bg-gray-dark-200 h-1 w-1 rounded-full bg-gray-500 ${opacity[dot]}
            duration-[${intervalTime / 1000}s] transition-all ease-in-out`}
          />
        ))}
      </div>
    </div>
  );
}
