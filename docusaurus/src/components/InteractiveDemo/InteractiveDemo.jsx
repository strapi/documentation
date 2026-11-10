import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './InteractiveDemo.module.scss';

// One folder per demo in docusaurus/interactive-demos/, named after the demo id. Its
// generated-capture.json is written by the capture script of the inki-interactive-demo skill.
const demoContext = require.context('@site/interactive-demos', true, /^\.\/[^/]+\/generated-capture\.json$/);
const DEMOS = Object.fromEntries(
  demoContext.keys().map((key) => [key.split('/')[1], demoContext(key)])
);

const TYPING_MS = 45;
const PAGE_WIDTH = 1920; // widths of the two captured sizes, see capture.js
const HD_WIDTH = 3840;
const SLOW_CONNECTIONS = ['slow-2g', '2g'];
const MAX_ZOOM = 2.5;

// Scenario texts use a tiny Markdown subset: **bold**, *italic*, [label](url) and line breaks.
function RichText({ text }) {
  return text.split('\n').map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
        if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <Link key={index} to={link[2]}>{link[1]}</Link>;
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </React.Fragment>
  ));
}

// Zoomed steps scale the screenshot so the target fills most of the frame, all in % of the frame.
function viewFor(step) {
  const rect = step?.rect;
  if (!rect || !step.zoom) return { scale: 1, x: 0, y: 0, rect };
  const scale = Math.min(MAX_ZOOM, 70 / rect.w, 70 / rect.h);
  const clamp = (value, min) => Math.min(0, Math.max(min, value));
  const x = clamp(6 - rect.x * scale, 100 - 100 * scale);
  const y = clamp(6 - rect.y * scale, 100 - 100 * scale);
  return { scale, x, y, rect: { x: rect.x * scale + x, y: rect.y * scale + y, w: rect.w * scale, h: rect.h * scale } };
}

// Places the bubble on the side of the target with the most room.
function bubblePlacement(rect) {
  if (!rect) return { side: 'center' };
  const right = 100 - (rect.x + rect.w);
  const below = 100 - (rect.y + rect.h);
  if (right >= 30) return { side: 'right', left: rect.x + rect.w, top: rect.y + rect.h / 2 };
  if (rect.x >= 30) return { side: 'left', left: rect.x, top: rect.y + rect.h / 2 };
  // Large areas leave no room on the sides: the bubble sits inside.
  if (rect.w * rect.h > 2500) return { side: 'inside', left: rect.x + rect.w / 2, top: rect.y + rect.h / 2 };
  if (below >= 25) return { side: 'below', left: rect.x + rect.w / 2, top: rect.y + rect.h };
  return { side: 'above', left: rect.x + rect.w / 2, top: rect.y };
}

// Data saver on, or a slow connection: wait for the reader to ask for the demo.
// navigator.connection is missing in some browsers, which then rely on lazy loading only.
function prefersDeferredLoading() {
  const connection = typeof navigator === 'undefined' ? null : navigator.connection;
  return Boolean(connection && (connection.saveData || SLOW_CONNECTIONS.includes(connection.effectiveType)));
}

function formatMegabytes(bytes) {
  return `${Math.max(0.1, Math.round(bytes / 100000) / 10)}\u00a0MB`;
}

function isEditable(element) {
  return element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
}

export default function InteractiveDemo({ id }) {
  const demo = DEMOS[id];
  const { colorMode } = useColorMode();
  const suffix = colorMode === 'dark' ? '_DARK' : '';
  const imageBase = useBaseUrl('/').replace(/\/$/, '');
  const [index, setIndex] = useState(-1); // -1 = intro, steps.length = outro
  const [typed, setTyped] = useState(null);
  const [nudge, setNudge] = useState(0);
  // Decided after hydration, so that a slow connection never starts downloading screenshots.
  const [loading, setLoading] = useState('pending'); // pending | deferred | ready
  const [frameWidth, setFrameWidth] = useState(800);
  const figureRef = useRef(null);
  const frameRef = useRef(null);
  const actionRef = useRef(null);
  const bubbleRef = useRef(null);
  const visibleRef = useRef(false);
  const typingRef = useRef(null);

  const total = demo ? demo.steps.length : 0;
  const step = demo && index >= 0 && index < total ? demo.steps[index] : null;
  const isIntro = index === -1;
  const isOutro = index === total;

  const src = (image) => `${imageBase}${image}${suffix}.webp`;
  const srcSet = (image) => `${src(image)} ${PAGE_WIDTH}w, ${imageBase}${image}-hd${suffix}.webp ${HD_WIDTH}w`;
  const go = useCallback((next) => {
    clearInterval(typingRef.current);
    setTyped(null);
    setIndex(Math.max(-1, Math.min(total, next)));
  }, [total]);

  // The reader performs the action: a fill step types its value before moving on.
  const act = useCallback(() => {
    if (!step) return;
    if (step.type !== 'fill') {
      go(index + 1);
      return;
    }
    if (typed !== null) return;
    let count = 0;
    setTyped('');
    typingRef.current = setInterval(() => {
      count += 1;
      setTyped(step.value.slice(0, count));
      if (count >= step.value.length) {
        clearInterval(typingRef.current);
        typingRef.current = setTimeout(() => go(index + 1), 350);
      }
    }, TYPING_MS);
  }, [step, typed, index, go]);

  // Decide how to load once in the browser, and track the frame width to pick the right image size.
  useEffect(() => {
    setLoading(prefersDeferredLoading() ? 'deferred' : 'ready');
    const frame = frameRef.current;
    if (!frame) return undefined;
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Preload the next screen so clicks feel instant.
  useEffect(() => {
    const next = demo?.steps[index + 1];
    if (!next || loading !== 'ready') return;
    const preload = new Image();
    preload.sizes = `${Math.round(frameWidth * viewFor(next).scale)}px`;
    preload.srcset = srcSet(next.image);
  }, [demo, index, suffix, loading, frameWidth]);

  // Keep keyboard focus on the action the reader is expected to take.
  useEffect(() => {
    if (index >= 0 && actionRef.current && frameRef.current?.contains(document.activeElement)) {
      actionRef.current.focus({ preventScroll: true });
    }
  }, [index]);

  // Left and right arrows drive the demo while it is on screen, without clicking into it first.
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.intersectionRatio >= 0.5;
    }, { threshold: [0, 0.5, 1] });
    observer.observe(figure);
    const onKeyDown = (event) => {
      if (loading !== 'ready' || (!visibleRef.current && !document.fullscreenElement)) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isEditable(event.target)) return;
      if (event.key === 'ArrowRight' && index < total) {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === 'ArrowLeft' && index > -1) {
        event.preventDefault();
        go(index - 1);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [index, total, go, loading]);

  // Keeps the bubble inside the frame whatever the target position and frame width.
  useEffect(() => {
    const fit = () => {
      const bubble = bubbleRef.current;
      const frame = frameRef.current;
      if (!bubble || !frame) return;
      bubble.style.translate = '';
      const b = bubble.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      const margin = 8;
      const dx = Math.max(0, f.left + margin - b.left) - Math.max(0, b.right - (f.right - margin));
      const dy = Math.max(0, f.top + margin - b.top) - Math.max(0, b.bottom - (f.bottom - margin));
      if (dx || dy) bubble.style.translate = `${dx}px ${dy}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      document.removeEventListener('fullscreenchange', fit);
    };
  }, [index]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else figureRef.current?.requestFullscreen?.();
  };

  if (!demo) return null;

  const image = isIntro ? demo.intro.image : isOutro ? demo.outro.image : step.image;
  const view = viewFor(step);
  const rect = view.rect;
  const isAction = step && (step.type === 'click' || step.type === 'fill');
  const isChapter = step?.type === 'chapter';
  const placement = isChapter ? { side: 'center' } : bubblePlacement(rect);
  const box = rect && { left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` };
  // Like Guideflow, the count includes the closing screen.
  const counter = <span className={styles.counter}>{index + 1}/{total + 1}</span>;

  return (
    <figure ref={figureRef} className={styles.demo} aria-label={demo.title}>
      <div className={styles.chrome}>
        <div className={styles.chromeSide}>
          <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
          <button type="button" className={styles.chromeButton} onClick={() => go(index - 1)} disabled={isIntro} aria-label="Previous step">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" /></svg>
          </button>
          <button type="button" className={styles.chromeButton} onClick={() => go(index + 1)} disabled={isOutro} aria-label="Next step">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
          <button type="button" className={styles.chromeButton} onClick={() => go(-1)} disabled={isIntro} aria-label="Restart">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" /></svg>
          </button>
        </div>
        <span className={styles.address}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.4" /><path d="M1.6 8h12.8M8 1.6c-2.3 2.3-2.3 10.5 0 12.8m0-12.8c2.3 2.3 2.3 10.5 0 12.8" /></svg>
          {demo.title}
        </span>
        <div className={clsx(styles.chromeSide, styles.chromeSideEnd)}>
          <button type="button" className={styles.chromeButton} onClick={toggleFullscreen} aria-label="Toggle full screen">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 2.5h4v4m0-4L9 7M6.5 13.5h-4v-4m0 4L7 9" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={frameRef}
        className={styles.frame}
        onClick={(event) => {
          // A click outside the expected target makes the hotspot pulse harder.
          if (isAction && !event.target.closest('button') && !bubbleRef.current?.contains(event.target)) setNudge((n) => n + 1);
        }}
      >
        <div className={styles.viewport} style={{ transform: `translate(${view.x}%, ${view.y}%) scale(${view.scale})` }}>
          {loading === 'ready' ? (
            <img
              className={styles.screen}
              src={src(image)}
              srcSet={srcSet(image)}
              sizes={`${Math.round(frameWidth * view.scale)}px`}
              width={demo.width}
              height={demo.height}
              loading="lazy"
              decoding="async"
              alt=""
              draggable={false}
            />
          ) : (
            <div className={styles.placeholder} style={{ aspectRatio: `${demo.width} / ${demo.height}` }} />
          )}
        </div>

        {(isIntro || isOutro) && loading === 'ready' && <div className={styles.backdrop} aria-hidden="true" />}

        {step?.type === 'explain' && rect && <div className={styles.spotlight} style={box} aria-hidden="true" />}

        {isAction && (
          <>
            {typed !== null && (
              <div className={styles.typed} style={box} aria-hidden="true">{typed}<span className={styles.caret} /></div>
            )}
            <button
              type="button"
              ref={actionRef}
              key={`${index}-${nudge}`}
              className={clsx(styles.target, nudge > 0 && styles.targetNudged)}
              style={box}
              onClick={act}
              aria-label={step.text.replace(/[*[\]]|\(.*?\)/g, '')}
            >
              <span className={styles.hotspot} aria-hidden="true"><span /></span>
            </button>
          </>
        )}

        {step && (
          <div
            ref={bubbleRef}
            key={index}
            className={clsx(
              styles.bubble,
              isAction ? styles.bubbleAction : isChapter ? styles.bubbleChapter : styles.bubbleExplain,
              styles[`bubble_${placement.side}`]
            )}
            style={placement.left === undefined ? undefined : { left: `${placement.left}%`, top: `${placement.top}%` }}
            role="status"
          >
            <div className={styles.bubbleText}><RichText text={step.text} /></div>
            {step.type === 'explain' && (
              <div className={styles.bubbleFooter}>
                {counter}
                <button type="button" className={styles.backButton} onClick={() => go(index - 1)}>Back</button>
                <button type="button" ref={actionRef} className={styles.nextButton} onClick={() => go(index + 1)}>Next</button>
              </div>
            )}
            {isChapter && (
              <div className={styles.bubbleFooter}>
                {counter}
                <button type="button" className={styles.arrowButton} onClick={() => go(index - 1)} aria-label="Back">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" /></svg>
                </button>
                <button type="button" ref={actionRef} className={styles.arrowButton} onClick={() => go(index + 1)} aria-label="Next">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {loading === 'deferred' && (
          <div className={styles.card}>
            <p className={styles.cardText}><RichText text={demo.intro.text} /></p>
            <p className={styles.cardNote}>
              Interactive demo, {total} steps, about {formatMegabytes(demo.bytes?.[colorMode === 'dark' ? 'dark' : 'light'] ?? 0)}.
            </p>
            <button type="button" className={styles.startButton} onClick={() => setLoading('ready')}>Load the demo</button>
          </div>
        )}

        {isIntro && loading === 'ready' && (
          <div className={styles.card}>
            <p className={styles.cardText}><RichText text={demo.intro.text} /></p>
            <button type="button" className={styles.startButton} onClick={() => go(0)}>{demo.intro.button}</button>
          </div>
        )}

        {isOutro && (
          <div className={styles.card}>
            <p className={styles.cardText}><RichText text={demo.outro.text} /></p>
            {demo.outro.links?.map((link) => (
              <Link key={link.href} className={styles.startButton} to={link.href}>{link.label}</Link>
            ))}
            <button type="button" className={styles.restartButton} onClick={() => go(-1)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" /></svg>
              Restart
            </button>
          </div>
        )}
      </div>

      <details className={styles.transcript}>
        <summary>Read the steps as text</summary>
        <ol>
          {demo.steps.map((item, itemIndex) => (
            <li key={itemIndex}>
              <RichText text={item.text} />
              {item.type === 'fill' && <> (type “{item.value}”)</>}
            </li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
