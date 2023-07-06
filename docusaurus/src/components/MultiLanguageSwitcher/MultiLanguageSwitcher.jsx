import clsx from 'clsx';
import React, {
  Children,
  cloneElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import styles from './multi-language-switcher.module.scss';

const localStorageKey = 'strapi-docs.multi-language-switcher';
const requestMdxType = 'MultiLanguageSwitcherRequest';

export function MultiLanguageSwitcher({ children, title }) {
  const [selectedLanguageKey, setSelectedLanguageKey] = useState('');

  /**
   * Filter the list of languages based on the property "language"
   * "MultiLanguageSwitcherRequest" child components existence.
   *
   * It generates an array of strings, eg.:
   * ['REST', 'Node', 'Browser']
   */
  const languages = useMemo(() => {
    return Children
      .map(
        children,
        ({ props: { language, mdxType } }) => (
          (language && mdxType === requestMdxType) && language
        )
      )
      .filter((languageKey) => !!languageKey)
    ;
  }, [children]);

  /**
   * Handle with the change of selected language
   *
   * @param {formSelectEvent}
   */
  const handleLanguageSelection = useCallback((formSelectEvent) => {
    const languageKey = (formSelectEvent?.target?.value || '');

    setSelectedLanguageKey(languageKey);
    localStorage.setItem(localStorageKey, languageKey);
  }, []);

  /**
   * Restore the selected language
   */
  useLayoutEffect(() => {
    if (!languages?.length) return;

    const localStorageInitialValue = (localStorage.getItem(localStorageKey) || '');
    const isLocalStorageInitialValueAValidOption = languages.includes(localStorageInitialValue);

    setSelectedLanguageKey(
      isLocalStorageInitialValueAValidOption ?
        localStorageInitialValue : (languages[0] || '')
    );
  }, [languages]);

  /**
   * Update the selected language when it's changed
   * by other MultiLanguageSwitcher component.
   */
  useLayoutEffect(() => {
    function onStorageEvent() {
      const storedLanguage = localStorage.getItem(localStorageKey);
      const isStoredLanguageAvailableHere = languages.includes(storedLanguage);

      if (!isStoredLanguageAvailableHere || (localStorageKey === selectedLanguageKey)) return;

      setSelectedLanguageKey(storedLanguage);
    }

    window.addEventListener('storage', onStorageEvent);

    return () => {
      window.removeEventListener('storage', onStorageEvent);
    }
  }, [selectedLanguageKey]);

  return (
    <div
      className={clsx(
        'strapi-docs-mls',
        styles['strapi-docs-mls'],
      )}
    >
      {/* Language Selector element */}
      {(languages?.length > 0) && (
        <div
          className={clsx(
            'strapi-docs-mls__switcher',
            styles['strapi-docs-mls__switcher'],
          )}
        >
          <select
            title="Select a different language example"
            value={selectedLanguageKey}
            onChange={handleLanguageSelection}
            className={clsx(
              'strapi-docs-mls__switcher__select',
              styles['strapi-docs-mls__switcher__select'],
            )}
          >
            {languages.map((optionLanguageKey) => {
              const optionLanguageElementKey = `${localStorageKey}-${optionLanguageKey}`;

              return (
                <option
                  key={optionLanguageElementKey}
                  id={optionLanguageElementKey}
                >
                  {optionLanguageKey}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Passing special props to specific components/children */}
      {Children.map(children, (child) =>
        cloneElement(
          child,
          {
            ...((child.props.mdxType !== requestMdxType) ? {} : {
              title,
              ...((child.props.language === selectedLanguageKey) ? {} : {
                hidden: true,
              }),
            }),
            ...child.props,
          }
        )
      )}
    </div>
  );
}
