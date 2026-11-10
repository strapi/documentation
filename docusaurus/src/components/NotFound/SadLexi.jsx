import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import AgentBot from '../AgentBot/AgentBot';
import { AskAiButton, DidYouMean, QuickLinks, Suggestions } from './shared';
import styles from './notFound.module.scss';

// What Lexi says when poked, in order
const LINES = [
  'Did someone change the slug without a redirect?',
  'I checked every locale. Nothing.',
  'OK, poking me will not publish it.',
  'Fine. You cheered me up.',
];

// What Lexi says when rapid pokes make it angry, in turn
const ANGRY_LINES = [
  'Hey! Stop poking me!',
  'Poking me will not bring the page back!',
  'I said STOP.',
  'Seriously. Hands off.',
];

/**
 * Proposal 1: Lexi is sad the page is gone, and cheers up as soon as the
 * reader heads somewhere useful (hovering a suggestion or Ask AI).
 */
export default function SadLexi() {
  const { pathname } = useLocation();
  const [hopeful, setHopeful] = useState(false);
  const [pokes, setPokes] = useState(0);
  const [waving, setWaving] = useState(false);
  // AgentBot gets angry on its own when poked too fast; the bubble follows it
  const [angry, setAngry] = useState(false);
  const [rants, setRants] = useState(0);
  const waveTimer = useRef(null);

  useEffect(() => () => clearTimeout(waveTimer.current), []);

  const cheered = pokes >= LINES.length - 1;
  let state = 'sad';
  if (angry) state = 'sad';
  else if (waving) state = 'wave';
  else if (hopeful || cheered) state = 'happy';

  const onAngryChange = (isAngry) => {
    setAngry(isAngry);
    if (isAngry) setRants((n) => n + 1);
  };

  const poke = () => {
    if (angry) {
      setRants((n) => n + 1);
      return;
    }
    setPokes((n) => Math.min(n + 1, LINES.length - 1));
    setWaving(true);
    clearTimeout(waveTimer.current);
    waveTimer.current = setTimeout(() => setWaving(false), 1200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.lexiStage}>
          <button
            type="button"
            onClick={poke}
            aria-label="Poke Lexi"
            style={{ all: 'unset', cursor: 'pointer', position: 'relative', display: 'inline-block' }}
          >
            <AgentBot state={state} size={150} decorative onAngryChange={onAngryChange} />
            <span key={angry ? `rant-${rants}` : pokes} className={styles.speech} aria-live="polite">
              {angry && ANGRY_LINES[(rants - 1) % ANGRY_LINES.length]}
              {!angry && (hopeful && !cheered ? 'Ooh, that one looks promising!' : LINES[pokes])}
            </span>
          </button>
        </div>
        <span className={styles.code404}>Error 404</span>
        <h1 className={styles.title}>This page was never published</h1>
        <p className={styles.lede}>
          Lexi looked everywhere for <code>{pathname}</code>: in Draft, in Published, even in the
          Releases. It is not there. The link may be old, or the page moved to a new home.
        </p>
        <DidYouMean onHover={setHopeful} />
        <div className={styles.actions}>
          <AskAiButton label="Ask Lexi where it went" onHover={setHopeful} />
        </div>
      </div>
      <Suggestions title="Lexi found these instead" onHover={setHopeful} />
      <QuickLinks />
    </div>
  );
}
