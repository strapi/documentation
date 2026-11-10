import React from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
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
  const { pathname, search } = useLocation();
  const v = new URLSearchParams(search).get('v') || '1';
  const [, , Variant] = VARIANTS.find(([key]) => key === v) || VARIANTS[0];

  return (
    <main>
      <Variant />
      <nav className={styles.switcher} aria-label="404 proposals">
        {VARIANTS.map(([key, label]) => (
          <Link key={key} to={`${pathname}?v=${key}`} aria-current={key === v ? 'true' : undefined}>
            {key}. {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
