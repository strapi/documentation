import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

export default function MermaidWithFallback({ chart, fallbackImage, alt, className }) {
  const [renderFailed, setRenderFailed] = useState(false);
  const mermaidRef = useRef(null);
  
  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidRef.current) {
        try {
          // Check whether Mermaid is already initialized
          if (!global.mermaidInitialized) {
            mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
            });
            global.mermaidInitialized = true;
          }
          
          // Delete previous content, if any
          mermaidRef.current.innerHTML = chart;
          
          // Try and render diagram
          await mermaid.run({
            nodes: [mermaidRef.current],
          });
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          setRenderFailed(true);
        }
      }
    };
    
    renderMermaid();
    
    // Add a safety net - check after 3 seconds if rendering failed
    const fallbackTimer = setTimeout(() => {
      if (mermaidRef.current && !mermaidRef.current.querySelector('svg')) {
        setRenderFailed(true);
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, [chart]);
  
  if (renderFailed) {
    return (
      <div className={className || 'mermaid-fallback-container'}>
        <img 
          src={fallbackImage} 
          alt={alt || 'Diagramme (fallback image)'} 
          className="mermaid-fallback-image"
        />
        <div className="mermaid-fallback-notice">
          <em><small>Please note that the diagram couldn't be rendered, probably due to a <a href="https://mermaid.js.org/">Mermaid.js</a> issue. A static image is displayed instead.</small></em>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className || 'mermaid-container'}>
      <div className="mermaid" ref={mermaidRef}>
        {chart}
      </div>
    </div>
  );
}