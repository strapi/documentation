import React from 'react';
import clsx from 'clsx';
import styles from './side-by-side-container.module.scss';

export function SideBySideContainer({ className, spaced = true, ...rest }) {
  return (
    <>
      <style
        id="side-by-side-container--styles-overrides"
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 997px) {
              main article:first-child:not(.col),
              main article:first-child:not(.col) + nav {
                max-width: 1200px !important;
              }
            }

            @media (max-width: 1536px) {
              .container > .row > .col.col--3 {
                display: none;
              }

              .container > .row > .col:first-child {
                max-width: 100% !important;
              }
            }
          `
        }}
      />

      <div
        className={clsx(
          styles['sbs-container'],
          spaced && styles['sbs-container--spaced'],
          className,
        )}
        {...rest}
      />
    </>
  );
}