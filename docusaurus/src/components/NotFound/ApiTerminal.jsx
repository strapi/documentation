import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { askAi, CorrectedPath, QuickLinks, useDidYouMean, useSuggestions } from './shared';
import styles from './notFound.module.scss';

const HELP = [
  ['ls', 'list pages that look like the one you wanted'],
  ['open <n>', 'go to suggestion number n'],
  ['ask <question>', 'ask the Strapi Docs AI'],
  ['cd cms | cd cloud', 'go to the CMS or Cloud docs'],
  ['home', 'back to the docs home'],
  ['clear', 'clear the screen'],
];

const CHIPS = ['help', 'ls', 'open 1', 'ask where did this page go?', 'cd cms', 'sudo publish'];

function NotFoundResponse({ pathname }) {
  const didYouMean = useDidYouMean();
  return (
    <pre>
      <span className={styles.dim}>$ </span>curl https://docs.strapi.io{pathname}
      {'\n'}
      <span className={styles.err}>HTTP/1.1 404 Not Found</span>
      {'\n\n'}
      {'{\n  '}<span className={styles.key}>"data"</span>: null,
      {'\n  '}<span className={styles.key}>"error"</span>: {'{\n    '}
      <span className={styles.key}>"status"</span>: 404,
      {'\n    '}<span className={styles.key}>"name"</span>: "NotFoundError",
      {'\n    '}<span className={styles.key}>"message"</span>: "This page has no published version",
      {'\n    '}<span className={styles.key}>"details"</span>: {'{'}
      {didYouMean && (
        <>
          {'\n      '}<span className={styles.key}>"didYouMean"</span>: "<Link to={didYouMean}><CorrectedPath path={didYouMean} /></Link>",
        </>
      )}
      {'\n      '}<span className={styles.key}>"hint"</span>: "type help"
      {'\n    }'}
      {'\n  }\n}'}
    </pre>
  );
}

/**
 * Proposal 2: the 404 is a Strapi REST API error, and the reader finds their
 * way with a tiny terminal. Chips under it give the same commands to mouse and
 * touch readers.
 */
export default function ApiTerminal() {
  const { pathname } = useLocation();
  const history = useHistory();
  const { items, loading } = useSuggestions(5);
  const [lines, setLines] = useState([]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (lines.length) bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const print = (cmd, out) => setLines((prev) => [...prev, { cmd, out }]);

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ');

    switch (name.toLowerCase()) {
      case 'help':
        print(cmd, HELP.map(([c, d]) => `${c.padEnd(18)} ${d}`).join('\n'));
        break;
      case 'ls':
        if (loading) print(cmd, <span className={styles.dim}>searching the index…</span>);
        else if (!items.length) print(cmd, <span className={styles.dim}>nothing similar. try: ask {'<question>'}</span>);
        else print(cmd, items.map((item, i) => (
          <div key={item.path}>
            <span className={styles.dim}>[{i + 1}]</span> <Link to={item.path}>{item.title}</Link>{' '}
            <span className={styles.dim}>{item.path}</span>
          </div>
        )));
        break;
      case 'open': {
        const item = items[Number(arg) - 1];
        if (item) {
          print(cmd, <span className={styles.ok}>200 OK → {item.path}</span>);
          history.push(item.path);
        } else print(cmd, <span className={styles.err}>no suggestion {arg || ''}. run ls first</span>);
        break;
      }
      case 'ask':
        print(cmd, <span className={styles.ok}>opening the Strapi Docs AI…</span>);
        askAi(pathname, arg && arg !== 'where did this page go?' ? arg : undefined);
        break;
      case 'cd':
        if (/^cloud/i.test(arg)) history.push('/cloud/intro');
        else if (/^cms/i.test(arg)) history.push('/cms/intro');
        else if (!arg || arg === '~' || arg === '/') history.push('/');
        else print(cmd, <span className={styles.err}>cd: {arg}: No such directory</span>);
        break;
      case 'home':
        history.push('/');
        break;
      case 'clear':
        setLines([]);
        break;
      case 'sudo':
        print(cmd, <span className={styles.err}>403 Forbidden: only a Super Admin can publish this page. Nice try.</span>);
        break;
      case 'rm':
        print(cmd, <span className={styles.err}>the page is already gone. we checked.</span>);
        break;
      default:
        print(cmd, <span className={styles.err}>{name}: command not found. type help</span>);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(value);
    setValue('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.code404}>Error 404</span>
        <h1 className={styles.title}>Even the API agrees: nothing here</h1>
        <p className={styles.lede}>
          The page you asked for has no published version. Find your way with the terminal, or
          click a command below it.
        </p>
      </div>

      <div className={styles.terminal}>
        <div className={styles.termBar}>
          <i /><i /><i />
          <span>strapi-docs — zsh</span>
        </div>
        <div className={styles.termBody} ref={bodyRef} onClick={() => inputRef.current?.focus()}>
          <NotFoundResponse pathname={pathname} />
          {lines.map((line, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <div className={styles.termLine}>
                <span className={styles.prompt}>docs ~ $</span>
                <span>{line.cmd}</span>
              </div>
              <pre>{line.out}</pre>
            </div>
          ))}
          <form className={styles.termLine} style={{ marginTop: 10 }} onSubmit={submit}>
            <label htmlFor="nf-terminal" className={styles.prompt}>docs ~ $</label>
            <input
              id="nf-terminal"
              ref={inputRef}
              className={styles.termInput}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder="type help"
            />
          </form>
        </div>
      </div>

      <div className={styles.chips}>
        {CHIPS.map((chip) => (
          <button key={chip} type="button" onClick={() => run(chip)}>{chip}</button>
        ))}
      </div>
      <QuickLinks />
    </div>
  );
}
