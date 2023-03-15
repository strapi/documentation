import React from 'react';
import Column from './Column';

export default function ColumnLeft(props) {
  return (
    <Column
      {...props}
      side="left"
    />
  );
}
