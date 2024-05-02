import React from 'react';

const ScreenshotNumberReference = ({ number }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        backgroundColor: '#4743FF',
        color: '#fff', 
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        padding: '0.1rem',
      }}
    >
      {number}
    </span>
  );
};

export default ScreenshotNumberReference;