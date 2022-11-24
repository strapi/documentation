import React from 'react'

export default function Response(props) {
  const { title = 'Example response '} = props;
  return (
      <div className="response">
        <div className="response-title">{ title }</div>
        <div className="response-content">{ props.children }</div>
      </div>
  );
}
