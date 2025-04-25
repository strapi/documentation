import React from 'react';
import styles from './homepageaibutton.module.scss';
import { InkeepHomepageButton } from '../Inkeep';

export default function HomepageAIButton(props) {
  return (
    <InkeepHomepageButton className={props.className} />
  );
}