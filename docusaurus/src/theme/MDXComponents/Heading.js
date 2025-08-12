import React from 'react';
import Heading from '@theme/Heading';
import { AiToolbar } from '../../components/AiToolbar';

export default function MDXHeading(props) {
  const isH1 = props.as === 'h1';
  
  return (
    <>
      <Heading {...props} />
      {isH1 && <AiToolbar />}
    </>
  );
}