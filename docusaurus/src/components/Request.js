import React from 'react'

export default function Request(props) {
  return (
      <div className="request">
        <div className="request-title">{ props.title }</div>
        <div className="request-content">{ props.children }</div>
      </div>
  );
}
