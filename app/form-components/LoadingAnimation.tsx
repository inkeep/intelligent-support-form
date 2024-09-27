'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const messages = ['Thinking', 'Looking for content', 'Analyzing'];

export function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => {
        if (prevIndex + 1 < messages.length) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 font-medium text-sm text-gray-500" aria-live="polite">
      <span className="animate-shimmer bg-gradient-to-br from-gray-500 to-gray-300 bg-clip-text text-transparent">
        {messages[messageIndex]}
      </span>
      <div className="flex space-x-1">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            initial={{ y: 0, opacity: 0.3 }}
            animate={{
              y: [0, -5, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              y: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                delay: i * 0.2,
                ease: 'easeInOut',
              },
              opacity: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                delay: i * 0.2,
                ease: 'easeInOut',
              },
            }}
          >
            .
          </motion.span>
        ))}
      </div>
    </div>
  );
}
