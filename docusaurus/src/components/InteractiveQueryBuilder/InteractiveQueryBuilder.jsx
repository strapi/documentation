import qs from 'qs';
import clsx from 'clsx';
import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { usePrismTheme } from '@docusaurus/theme-common';
import { Button } from '../Button/Button';
import { FormField } from '../Form';
import styles from './interactive-query-builder.module.scss';

export function InteractiveQueryBuilder({
  className,
  code: inheritCode = '',
  endpoint: inheritEndpoint = '/api/books',
  id: inheritId = '',
}) {
  const id = (inheritId || `strapi-iqb-${Math.random()}`);
  const localStorageKey = `strapi-iqb-value-for-${inheritEndpoint}`;
  const prismTheme = usePrismTheme();
  const [code, setCode] = useState(inheritCode.trim());
  const [endpoint, setEndpoint] = useState(inheritEndpoint);
  const [queryString, setQueryString] = useState('');
  const [clipboardStatus, setClipboardStatus] = useState('');
  const [isEditorDisabled, setIsEditorDisabled] = useState(true);

  /**
   * Copy to Clipboard
   */
  const handleClickClipboard = useCallback((textToCopy) => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setClipboardStatus('success');
    } catch (err) {
      setClipboardStatus('error');
    } finally {
      setTimeout(() => setClipboardStatus(''), 5000);
    }
  }, []);

  /**
   * Local state management to the "Endpoint" input field.
   * Additionally, storage the changed value to the Browser's LocalStorage API.
   */
  const handleEndpointChange = useCallback((evt) => {
    setEndpoint(evt.target.value);

    if (evt.target.value === inheritEndpoint) {
      localStorage.removeItem(localStorageKey);
    } else {
      localStorage.setItem(localStorageKey, evt.target.value);
    }
  }, [inheritEndpoint, localStorageKey]);

  /**
   * Restore the "Endpoint" input field value, based on what the user have typed before.
   */
  useLayoutEffect(() => {
    const endpointChangedBeforeByUser = localStorage.getItem(localStorageKey);

    if (typeof endpointChangedBeforeByUser !== 'string') {
      return;
    }

    setEndpoint(endpointChangedBeforeByUser);
  }, [localStorageKey]);

  const handleEditorFocus = useCallback(() => {
    setIsEditorDisabled(false);
  }, []);

  const handleEditorBlur = useCallback(() => {
    setIsEditorDisabled(true);
  }, []);

  return (
    <form
      noValidate
      onSubmit={(evt) => evt.preventDefault()}
      className={clsx('strapi-iqb', styles.iqb, className)}
    >
      <LiveProvider
        language="jsx"
        theme={prismTheme}
        code={code.trim()}
        scope={{
          qs,
          endpoint,
          setQueryString,
          useEffect,
        }}
        transformCode={(writtenQueryByUser) =>
          `() => {
            const queryObject =


  ${writtenQueryByUser}


            ;

            useEffect(() => {
              setQueryString(
                endpoint +
                '?' +
                qs.stringify(queryObject, { encode: false })
              );
            }, [endpoint, queryObject]);

            return null;
          }`
        }
      >
        <FormField
          id={`${id}-endpoint`}
          label="Endpoint:"
          input={{
            value: endpoint,
            onChange: handleEndpointChange,
          }}
          hint="Please keep the /api/ part unless you explicitly configured it differently in your project."
        />
        <FormField
          id={`${id}-query`}
          label="Endpoint Query Parameters:"
          hint="Feel free to modify the code above."
        >
          <div
            onBlur={() => handleEditorBlur()}
            onClick={() => handleEditorFocus()}
            style={{ cursor: 'text' }}
          >
            <LiveEditor
              className={clsx(styles.iqb__editor)}
              code={code}
              onChange={setCode}
              disabled={isEditorDisabled}
            />
          </div>
        </FormField>
        <LiveError />
        <LivePreview />
        <FormField
          id={id + '-result'}
          label="Query String URL:"
          input={{
            'aria-disabled': true,
            as: 'textarea',
            readOnly: true,
            value: queryString,
          }}
        />
        <Button
          id={id + '-copy-to-clipboard'}
          type="button"
          variant="secondary"
          onClick={() => handleClickClipboard(queryString)}
        >
          Copy to clipboard
          <span style={{ marginLeft: '0.25rem' }}>
            {clipboardStatus === '' && ' 📑'}
            {clipboardStatus === 'error' && ' ❌'}
            {clipboardStatus === 'success' && ' ✅'}
          </span>
        </Button>
      </LiveProvider>
    </form>
  );
}
