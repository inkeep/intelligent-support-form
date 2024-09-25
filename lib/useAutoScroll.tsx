import { useRef } from 'react';
import { useScrollUpDetection } from './useScrollUpDetection';

const isSafari = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const userAgent: string = window.navigator?.userAgent?.toLowerCase();
  let safariAgent = userAgent.includes('safari');
  const chromeAgent = userAgent.includes('chrome');
  // Discard Safari since it also matches Chrome
  if (chromeAgent && safariAgent) safariAgent = false;
  return safariAgent;
};

export const useAutoScroll = () => {
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const containerRef = useRef<null | HTMLDivElement>(null);
  const scrollBehavior = isSafari() ? 'auto' : 'smooth';

  const { userScrolledUp, setUserScrolledUp } = useScrollUpDetection({ containerRef });

  const isScrolling = useRef(false);

  function scrollToBottom(force = false) {
    if (scrollRef.current && force) {
      userScrolledUp.current = false;
      isScrolling.current = false;
      return scrollRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
    }

    if (!scrollRef.current) return;
    if (userScrolledUp.current) return;

    // Let instant scroll happen
    if (scrollBehavior !== 'smooth') {
      return scrollRef.current.scrollIntoView({
        behavior: scrollBehavior,
        block: 'end',
      });
    }

    // If we want to smooth scroll, we need to wait for the previous scroll to finish
    if (isScrolling.current) {
      return;
    }

    isScrolling.current = true;
    const observer = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();

        // Batch scroll animations to prevent sluggish transition
        setTimeout(() => {
          isScrolling.current = false;
        }, 300);
      }
    });
    observer.observe(scrollRef.current);
    scrollRef.current.scrollIntoView({
      behavior: scrollBehavior,
      block: 'end',
    });
  }

  return { scrollRef, containerRef, scrollToBottom, userScrolledUp, setUserScrolledUp };
};
