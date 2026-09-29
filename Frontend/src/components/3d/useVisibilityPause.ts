import { useEffect, useState } from 'react';

export function useVisibilityPause(targetRef: React.RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setVisible(entry ? entry.isIntersecting : true);
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => setVisible(document.visibilityState === 'visible' && (el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0));
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetRef]);

  return visible;
}
