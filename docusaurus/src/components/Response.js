import React from 'react'

export default function Response(props) {
  return (
      <div className="response">
        <div className="response-title">{ props.title }</div>
        <div className="response-content">{ props.children }</div>
      </div>
  );
}
