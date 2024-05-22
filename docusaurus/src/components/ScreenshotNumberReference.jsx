import React from 'react';

const ScreenshotNumberReference = ({ number }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1.5rem',
        height: '1.5rem',
        borderRadius: '50%',
        backgroundColor: '#4743FF',
        color: '#fff', 
        textAlign: 'center',
        fontSize: '.8rem',
        fontWeight: 'bold',
        padding: '0.1rem',
      }}
    >
      {number}
    </span>
  );
};

export default ScreenshotNumberReference;