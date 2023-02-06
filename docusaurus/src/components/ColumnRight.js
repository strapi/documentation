import React from 'react'

export default function ColumnRight(props) {
  const { title = '' } = props;

  return (
      <div className="column-right">
        <div className="column-title">{ title }</div>
        <div className="column-content">
          {props.children}
        </div>
      </div>
  );
}
