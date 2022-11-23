import React from 'react'

export default function ApiCall(props) {
  const { noSideBySide = false } = props;
  return (
      <div className={`api-call ${noSideBySide ? 'api-call--no-side-by-side' : ''}`}>
        { props.children }
      </div>
  );
}
