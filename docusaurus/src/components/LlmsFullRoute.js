import React, { useEffect, useState } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function LlmsFullRoute() {
  const [content, setContent] = useState('Loading llms-full.txt...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assure-toi qu'on est côté client
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    const fetchContent = async () => {
      try {
        const response = await fetch('/llms-full.txt');
        if (response.ok) {
          const data = await response.text();
          setContent(data);
        } else {
          setContent('# Error\n\nllms-full.txt not found. Please run the generator first or check the build.');
        }
      } catch (error) {
        console.error('Error fetching llms-full.txt:', error);
        setContent('# Error\n\nFailed to load llms-full.txt. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      document.title = 'llms-full.txt - Strapi Documentation';
    }
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        Loading llms-full.txt...
      </div>
    );
  }

  return (
    <pre style={{ 
      whiteSpace: 'pre-wrap', 
      fontFamily: 'monospace',
      padding: '20px',
      margin: 0,
      fontSize: '14px',
      lineHeight: '1.4',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px'
    }}>
      {content}
    </pre>
  );
}