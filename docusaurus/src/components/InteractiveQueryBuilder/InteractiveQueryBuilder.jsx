import qs from 'qs';
import clsx from 'clsx';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { usePrismTheme } from '@docusaurus/theme-common';
import { Button } from '../Button/Button';
import { FormField } from '../Form';
import styles from './interactive-query-builder.module.scss';

export function InteractiveQueryBuilder({
  className,
  code = '',
  endpoint: inheritEndpoint = '/api/books',
  id: inheritId = '',
}) {
  const id = (inheritId || `strapi-iqb-${Math.random()}`);
  const localStorageKey = `strapi-iqb-value-for-${inheritEndpoint}`;
  const prismTheme = usePrismTheme();
  const [endpoint, setEndpoint] = useState(inheritEndpoint);
  const [clipboardStatus, setClipboardStatus] = useState('');

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

  return (
    <form
      onSubmit={(evt) => evt.preventDefault()}
      className={clsx(styles.iqb, className)}
    >
      <LiveProvider
        language="jsx"
        theme={prismTheme}
        code={code.trim()}
        scope={{
          clipboardStatus,
          endpoint,
          handleClickClipboard,
          id,
          qs,
          Button,
          FormField,
        }}
        transformCode={(writtenQueryByUser) =>
          `() => {
            const queryObject =


  ${writtenQueryByUser}


            ;

            const queryStringified = (
              endpoint +
              '?' +
              qs.stringify(queryObject, { encodeValuesOnly: true })
            );

            return (
              <>
                <FormField
                  id={id + '-result'}
                  label="Query String URL:"
                  input={{
                    'aria-disabled': true,
                    readOnly: true,
                    value: queryStringified,
                  }}
                />
                <Button
                  id={id + '-copy-to-clipboard'}
                  type="button"
                  variant="secondary"
                  onClick={() => handleClickClipboard(queryStringified)}
                >
                  Copy to clipboard
                  <span style={{ marginLeft: '0.25rem' }}>
                    {clipboardStatus === '' && ' 📑'}
                    {clipboardStatus === 'error' && ' ❌'}
                    {clipboardStatus === 'success' && ' ✅'}
                  </span>
                </Button>
              </>
            );
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
        />
        <FormField
          id={`${id}-query`}
          label="Endpoint Query Parameters:"
          hint="Feel free to modify the code above."
        >
          <LiveEditor className={clsx(styles.iqb__editor)} />
        </FormField>
        <LiveError />
        <LivePreview />
      </LiveProvider>
    </form>
  );
}
