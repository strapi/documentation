import React from 'react';
import Link from '@docusaurus/Link';
import Icon from './Icon';

export const ExternalLink = ({to, name}) => (
  <Link to={to}>
    {name}&nbsp;<Icon name="arrow-square-out" classes="ph-fill external-link" />
  </Link>
)