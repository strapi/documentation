import React from 'react';
import TOC from '@theme-original/TOC';
import CollapsibleTOC from '../../components/CollapsibleTOC/CollapsibleTOC';

export default function TOCWrapper(props) {
  return (
    <CollapsibleTOC>
      <TOC {...props} />
    </CollapsibleTOC>
  );
}
