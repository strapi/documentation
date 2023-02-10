import React from 'react'

export default function ColumnLeft(props) {
  const { title = '' } = props;

  return (
      <div className="column-left">
        <div className="column-title">{ title }</div>
        <div className="column-content">
          {props.children}
        </div>
      </div>
  );
}
