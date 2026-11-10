import React, { useCallback, useEffect, useRef, useState } from 'react';
import AgentBot from '../AgentBot/AgentBot';
import { AskAiButton, DidYouMean, QuickLinks, Suggestions } from './shared';
import styles from './notFound.module.scss';

const BEST_KEY = 'strapi-404-best';
const LEXI = 52;
const GRAVITY = 2600; // px/s²
const JUMP = 820; // px/s
const START_SPEED = 300; // px/s
const MAX_SPEED = 720;
// Lexi's hitbox is smaller than the tile so near misses feel fair
const HIT_INSET = 10;

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private windows can refuse storage; the best score just is not kept
  }
}

/**
 * Proposal 3: a tiny endless runner. Lexi jumps over 404 tiles; the game runs
 * on one requestAnimationFrame loop that writes transforms straight to the DOM.
 */
export default function LexiRun() {
  const stageRef = useRef(null);
  const lexiRef = useRef(null);
  const obstacleRefs = useRef([]);
  const cloudRefs = useRef([]);
  const scoreRef = useRef(null);
  const game = useRef(null);
  const happyTimer = useRef(null);

  const [phase, setPhase] = useState('ready'); // ready | running | over
  const [lexiState, setLexiState] = useState('wave');
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => setBest(readBest()), []);

  const reset = () => {
    const width = stageRef.current.clientWidth;
    game.current = {
      y: 0,
      vy: 0,
      speed: START_SPEED,
      distance: 0,
      nextMilestone: 100,
      obstacles: [0, 1, 2].map((i) => ({ x: width + 200 + i * 420, h: 34 })),
      clouds: [0, 1, 2, 3].map((i) => ({ x: (width / 4) * i + 40, y: 20 + ((i * 37) % 70) })),
    };
  };

  const jump = useCallback(() => {
    if (phase !== 'running') {
      reset();
      setPhase('running');
      setLexiState('idle');
      return;
    }
    const g = game.current;
    if (g.y === 0) g.vy = JUMP;
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const stage = stageRef.current;
    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const g = game.current;
      const width = stage.clientWidth;

      // Lexi
      g.vy -= GRAVITY * dt;
      g.y = Math.max(0, g.y + g.vy * dt);
      if (g.y === 0) g.vy = 0;
      lexiRef.current.style.transform = `translateY(${-g.y}px)`;

      // World
      g.speed = Math.min(MAX_SPEED, g.speed + 8 * dt);
      g.distance += g.speed * dt;
      const score = Math.floor(g.distance / 20);
      scoreRef.current.textContent = String(score).padStart(5, '0');
      if (score >= g.nextMilestone) {
        g.nextMilestone += 100;
        setLexiState('happy');
        clearTimeout(happyTimer.current);
        happyTimer.current = setTimeout(() => setLexiState('idle'), 900);
      }

      const farthest = Math.max(...g.obstacles.map((o) => o.x));
      let hit = false;
      g.obstacles.forEach((o, i) => {
        o.x -= g.speed * dt;
        if (o.x < -40) {
          // Gaps shrink a little as the game speeds up, never below a fair jump
          o.x = Math.max(farthest, width) + 260 + Math.random() * 360;
          o.h = Math.random() < 0.35 ? 52 : 34;
        }
        const el = obstacleRefs.current[i];
        el.style.transform = `translateX(${o.x}px)`;
        el.style.height = `${o.h}px`;

        const lexiLeft = 48 + HIT_INSET;
        const lexiRight = 48 + LEXI - HIT_INSET;
        if (o.x < lexiRight && o.x + 34 > lexiLeft && g.y < o.h - 4) hit = true;
      });

      g.clouds.forEach((c, i) => {
        c.x -= g.speed * 0.25 * dt;
        if (c.x < -20) c.x = width + Math.random() * 120;
        cloudRefs.current[i].style.transform = `translate(${c.x}px, ${c.y}px)`;
      });

      if (hit) {
        setFinalScore(score);
        setBest((prev) => {
          const next = Math.max(prev, score);
          if (next > prev) saveBest(next);
          return next;
        });
        setLexiState('sad');
        setPhase('over');
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => () => clearTimeout(happyTimer.current), []);

  const onKeyDown = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      e.preventDefault();
      jump();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.code404}>Error 404</span>
        <h1 className={styles.title}>You found a dead end. Lexi found a game.</h1>
        <p className={styles.lede}>
          The page is gone, but the 404s are everywhere. Help Lexi jump over them, then pick a
          real page below.
        </p>
        <DidYouMean />
      </div>

      <div
        ref={stageRef}
        className={styles.game}
        role="button"
        tabIndex={0}
        aria-label="Lexi Run mini game. Press Space to jump."
        onPointerDown={jump}
        onKeyDown={onKeyDown}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} ref={(el) => { cloudRefs.current[i] = el; }} className={styles.cloudBlock} />
        ))}
        <div className={styles.ground} />
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            ref={(el) => { obstacleRefs.current[i] = el; }}
            className={styles.obstacle}
            style={{ transform: 'translateX(-100px)', height: 34 }}
          >
            404
          </span>
        ))}
        <span ref={lexiRef} className={styles.runner}>
          <AgentBot state={lexiState} size={LEXI} shadow={false} decorative />
        </span>
        <span className={styles.score}>
          {best > 0 && <>HI {String(best).padStart(5, '0')} · </>}
          <span ref={scoreRef}>00000</span>
        </span>

        {phase === 'ready' && (
          <div className={styles.overlay}>
            <strong>Lexi Run</strong>
            <span>Press Space or tap to start, then to jump</span>
          </div>
        )}
        {phase === 'over' && (
          <div className={styles.overlay}>
            <strong>Lexi tripped on a 404</strong>
            <span>Score {finalScore}{finalScore >= best && finalScore > 0 ? ', new best!' : ''} · Space or tap to retry</span>
          </div>
        )}
      </div>

      <div className={styles.actions} style={{ marginTop: 24, justifyContent: 'center' }}>
        <AskAiButton label="Rather ask AI where the page went" />
      </div>
      <Suggestions title="Real pages, no jumping required" />
      <QuickLinks />
    </div>
  );
}
