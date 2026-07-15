import React from 'react';

const ScreenshotNumberReference = ({ number }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5rem',
        height: '1.5rem',
        borderRadius: '50%',
        backgroundColor: '#4743FF',
        color: '#fff',
        fontSize: '.8rem',
        fontWeight: 'bold',
        verticalAlign: 'middle',
      }}
    >
      {number}
    </span>
  );
};

export default ScreenshotNumberReference;