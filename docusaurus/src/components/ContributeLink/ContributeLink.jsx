import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import {translate} from '@docusaurus/Translate';
import styles from './contribute-link.module.scss';
import Icon from '../Icon';
import CopyMarkdownButton from '../CopyMarkdownButton';

export default function ContributeLink() {
  const {siteConfig} = useDocusaurusContext();
  const {activeDoc} = useActiveDocContext();
  
  // Early return if no activeDoc
  if (!activeDoc) {
    return null;
  }
  
  // Get the base edit URL from docusaurus config
  const editUrl = siteConfig.presets?.[0]?.[1]?.docs?.editUrl || 
                 siteConfig.themeConfig?.docs?.editUrl || 
                 'https://github.com/strapi/documentation/edit/main/docusaurus';
  
  // Construct the full edit URL using the document path
  const fullEditUrl = `${editUrl}/docs/${activeDoc.id}.md`;
  
  // Use the translated string from i18n
  const editThisPageMessage = translate({
    id: 'theme.common.editThisPage',
    message: 'Contribute to this page on GitHub',
    description: 'The link label to edit the current page',
  });
  
  return (
    <div className={clsx(styles.contributeLink)}>
      <a href={fullEditUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="pencil-simple" /> <span>{editThisPageMessage}</span>
      </a>
      <CopyMarkdownButton Icon={Icon} />
    </div>
  );
}