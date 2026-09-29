import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

void React;
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

const EDCHero3D = lazy(() => import('../3d/EDCHero3D'));

interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryLink: { label: string; href: string };
  secondaryLink: { label: string; href: string };
}

export default function Hero({ eyebrow, title, description, primaryLink, secondaryLink }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    const container = containerRef.current;
    const copy = copyRef.current;
    if (!hero || !container || !copy) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(container, { scale: 0.35, y: -40, opacity: 0, borderRadius: 40 });
      gsap.set(copy, { opacity: 1, y: 0, pointerEvents: 'auto' });
      setScrollProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => setScrollProgress(self.progress),
        },
      });

      // Container shrink + fade — end-to-end to receded rounded
      tl.fromTo(
        container,
        { scale: 1, y: 0, opacity: 1, borderRadius: 0 },
        { scale: 0.35, y: -40, opacity: 0, borderRadius: 40, duration: 0.7, ease: 'power2.inOut' },
        0,
      );

      // Text fade in + slide up — 0.55 → 1.0 per spec, no fade-out
      tl.fromTo(
        copy,
        { opacity: 0, y: 40, pointerEvents: 'none' },
        { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.45, ease: 'power2.out' },
        0.55,
      );
    }, hero);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} data-header-region aria-labelledby="hero-title">
      <div className={styles.heroSticky}>
      <div ref={containerRef} className={styles.heroContainer} aria-hidden="true">
        <Suspense fallback={<div className={styles.fallback} aria-hidden="true" />}>
          <EDCHero3D scrollProgress={scrollProgress} />
        </Suspense>
      </div>
      <div ref={copyRef} className={styles.heroCopy}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="hero-title">{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={(e) => {
              e.preventDefault();
              // eslint-disable-next-line no-console
              console.log('explore clicked');
              document.getElementById('initiatives')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {primaryLink.label}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={(e) => {
              e.preventDefault();
              // eslint-disable-next-line no-console
              console.log('events clicked');
              document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {secondaryLink.label}
          </button>
        </div>
        <p className={styles.meta}>Scroll to explore — the hero fades as you scroll.</p>
      </div>
      </div>
    </section>
  );
}
