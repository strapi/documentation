import React from 'react';
import { DocSearch } from '@docsearch/react';
import docusaurusConfig from '../../../docusaurus.config';
import styles from './search-bar.module.scss';

export function SearchBar(props) {
  return (
    <div className={styles['search-bar']}>
      <DocSearch
        {...docusaurusConfig.themeConfig.algolia}
        {...props}
      />
    </div>
  );
}
