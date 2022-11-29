import React from 'react'

export default function Request(props) {
  const { title = 'Example request' } = props;
  return (
      <div className="request">
        <div className="request-title">{ title }</div>
        <div className="request-content">{ props.children }</div>
      </div>
  );
}
