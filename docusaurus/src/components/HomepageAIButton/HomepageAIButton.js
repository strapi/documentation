import React from 'react';
import styles from './homepageaibutton.module.scss';
import Icon from '../Icon';
import { useInkeepModal } from '../../hooks/useInkeepModal'; // adapte selon ton arborescence

export default function HomepageAIButton() {
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
}
