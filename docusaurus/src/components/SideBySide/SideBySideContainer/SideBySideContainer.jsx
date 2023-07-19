import React from 'react';
import clsx from 'clsx';
import styles from './side-by-side-container.module.scss';

export function SideBySideContainer({ className, spaced = true, ...rest }) {
  return (
    <>
      {/* Styles to increase the page-content width */}
      <style
        id="side-by-side-container--styles-overrides"
        dangerouslySetInnerHTML={{
          __html: `
            /**
             * Overrides applied by the component 'SideBySideContainer'
             */
            @media (min-width: 997px) {

              /**
               * Increase the general container size
               */
              main article:first-child:not(.col),
              main article:first-child:not(.col) + nav {
                --custom-main-width: 120rem;
              }
            }

            @media (max-width: 1536px) {
              /**
               * Hide the right-side nav (table of contents)
               */
              .container > .row > .col.col--3 {
                display: none;
              }

              /**
               * Increase the content-column size
               */
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
