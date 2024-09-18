import React, { useEffect, useRef } from 'react';

type ContainerRefType = React.MutableRefObject<HTMLDivElement | null>;

interface UseScrollUpDetectionParams {
  containerRef: ContainerRefType;
}

export const useScrollUpDetection = ({ containerRef }: UseScrollUpDetectionParams) => {
  const userScrolledUp = useRef(false);
  const prevScrollTop = useRef<number>(0);

  useEffect(() => {
    const currentContainer = containerRef?.current;

    const onScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;
        if (scrollBottom > 20 && scrollTop < prevScrollTop.current) {
          userScrolledUp.current = true;
        } else if (scrollBottom < 1) {
          // Scrolled to the bottom, reset the flag
          userScrolledUp.current = false;
        }
        prevScrollTop.current = scrollTop;
      }
    };

    if (currentContainer) {
      currentContainer.addEventListener('scroll', onScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', onScroll);
      }
    };
  }, [containerRef]);

  return {
    userScrolledUp,
    setUserScrolledUp: (state: boolean) => {
      userScrolledUp.current = state;
    },
  };
};
