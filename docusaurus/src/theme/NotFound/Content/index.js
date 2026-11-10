import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import SadLexi from '@site/src/components/NotFound/SadLexi';
import ApiTerminal from '@site/src/components/NotFound/ApiTerminal';
import LexiRun from '@site/src/components/NotFound/LexiRun';

const VARIANTS = { 1: SadLexi, 2: ApiTerminal, 3: LexiRun };
// The Lexi Run game is listed twice, so it comes up twice as often as each
// of the other two
const DRAW = ['1', '2', '3', '3'];

// Each visit to a missing page draws one of the three 404 pages at random;
// ?v=1, ?v=2 or ?v=3 forces one
function RandomNotFound() {
  const { search } = useLocation();
  const forced = new URLSearchParams(search).get('v');
  const [drawn] = useState(() => DRAW[Math.floor(Math.random() * DRAW.length)]);
  const Variant = VARIANTS[forced] || VARIANTS[drawn];
  return <Variant />;
}

export default function NotFoundContent() {
  // The static 404.html is built for /404 and served on any missing URL, so
  // everything that reads the URL renders in the browser only
  const isBrowser = useIsBrowser();
  return <main>{isBrowser ? <RandomNotFound /> : <div style={{ minHeight: '70vh' }} />}</main>;
}
