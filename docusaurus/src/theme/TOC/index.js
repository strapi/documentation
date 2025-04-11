import React from 'react';
import TOC from '@theme-original/TOC';
import ContributeLink from '../../components/ContributeLink';

export default function TOCWrapper(props) {
  return (
    <>
      <TOC {...props} />
      <ContributeLink />
    </>
  );
}