import type { Breakpoint } from '$lib/types/breakpoint';

export const getBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'small';

  if (window.innerWidth >= 1024) return 'large';
  if (window.innerWidth >= 768) return 'medium';
  return 'small';
};

export const listenBreakpointChange = (callback: (breakpoint: Breakpoint) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleResize = () => {
    callback(getBreakpoint());
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  return () => {
    window.removeEventListener('resize', handleResize);
  };
};
