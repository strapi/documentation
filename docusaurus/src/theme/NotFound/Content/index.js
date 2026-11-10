import React from 'react';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import SadLexi from '@site/src/components/NotFound/SadLexi';
import ApiTerminal from '@site/src/components/NotFound/ApiTerminal';
import LexiRun from '@site/src/components/NotFound/LexiRun';
import styles from '@site/src/components/NotFound/notFound.module.scss';

// Three 404 proposals, compared with ?v=1, ?v=2 or ?v=3 until one is picked
const VARIANTS = [
  ['1', 'Sad Lexi', SadLexi],
  ['2', 'Terminal', ApiTerminal],
  ['3', 'Lexi Run', LexiRun],
];

export default function NotFoundContent() {
  const { search } = useLocation();
  // The static 404.html is built for /404 and served on any missing URL, so
  // everything that reads the URL renders in the browser only
  const isBrowser = useIsBrowser();
  if (!isBrowser) return <main style={{ minHeight: '70vh' }} />;

  const v = new URLSearchParams(search).get('v') || '1';
  const [, , Variant] = VARIANTS.find(([key]) => key === v) || VARIANTS[0];

  return (
    <main>
      <Variant />
      <nav className={styles.switcher} aria-label="404 proposals">
        {VARIANTS.map(([key, label]) => (
          <a key={key} href={`?v=${key}`} aria-current={key === v ? 'true' : undefined}>
            {key}. {label}
          </a>
        ))}
      </nav>
    </main>
  );
}
