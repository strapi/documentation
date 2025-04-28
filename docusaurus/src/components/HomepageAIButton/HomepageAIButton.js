import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './homepageaibutton.module.scss';
import Icon from '../Icon';

export default function HomepageAIButton() {
  return (
    <BrowserOnly fallback={<div />}>
      {() => {
        const { useInkeepModal } = require('../../hooks/useInkeepModal');
        const { openChat, modal } = useInkeepModal();

        return (
          <>
            <div className={styles['homepage-ai-button-container']}>
              <button
                className={`${styles['homepage-ai-button']} kapa-widget-button`}
                onClick={openChat}
              >
                <Icon name="sparkle" />
                <p>Ask AI anything</p>
              </button>
            </div>

            {/* Modal */}
            {modal}
          </>
        );
      }}
    </BrowserOnly>
  );
}
