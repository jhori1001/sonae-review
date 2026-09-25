'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children, className = '', stagger = false }: { children: ReactNode; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);
  return <div ref={ref} className={['reveal', stagger && 'stagger', visible && 'in-view', className].filter(Boolean).join(' ')}>{children}</div>;
}
