import React from 'react';
import styles from './ApiDocLayout.module.scss';

function Description({ children }) {
  return <div className={styles.description}>{children}</div>;
}

function Code({ children }) {
  return <div className={styles.code}>{children}</div>;
}

function ApiDocLayout({ children }) {
  return <div className={styles.layout}>{children}</div>;
}

ApiDocLayout.Description = Description;
ApiDocLayout.Code = Code;

export default ApiDocLayout;
