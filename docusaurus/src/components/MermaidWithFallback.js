// src/components/DocusaurusMermaidFileFallback.js
import React, { useEffect, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function DocusaurusMermaidFileFallback({ 
  chartFile,
  fallbackImage, 
  fallbackImageDark, 
  alt, 
  className 
}) {
  const [chartContent, setChartContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [renderFailed, setRenderFailed] = useState(false);
  const { colorMode } = useColorMode();
  
  // Determine which image to display based on the current theme
  const imageToShow = colorMode === 'dark' && fallbackImageDark 
    ? fallbackImageDark 
    : fallbackImage;
  
  // Load chart content from file
  useEffect(() => {
    if (chartFile) {
      setIsLoading(true);
      
      fetch(chartFile)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load chart file: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(content => {
          console.log('Mermaid file loaded successfully:', chartFile);
          setChartContent(content.trim());
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading Mermaid chart file:', error);
          setRenderFailed(true);
          setIsLoading(false);
        });
    }
  }, [chartFile]);
  
  // Check if Mermaid rendering has succeeded
  useEffect(() => {
    if (!isLoading && chartContent) {
      // Set a timer to check if Mermaid has rendered the diagram
      const timer = setTimeout(() => {
        // Look for the Mermaid container that we created
        const mermaidContainer = document.querySelector(`.mermaid-container-${chartFile.replace(/[^a-zA-Z0-9]/g, '')}`);
        if (mermaidContainer) {
          const mermaidDiv = mermaidContainer.querySelector('.mermaid');
          
          // Conditions to considérer le rendu comme échoué :
          // 1. Pas de SVG (le diagramme n'a pas été rendu)
          // 2. OU présence d'un message d'erreur de Mermaid (l'icône de bombe)
          if (
            !mermaidDiv.querySelector('svg') || 
            mermaidDiv.textContent.includes('Syntax error') ||
            mermaidDiv.querySelector('.error-icon')
          ) {
            setRenderFailed(true);
          }
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [chartContent, isLoading, chartFile]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={className || 'mermaid-loading-container'}>
        <div className="mermaid-loading">
          <em>Loading diagram...</em>
        </div>
      </div>
    );
  }
  
  // Show fallback image if rendering failed or file loading failed
  if (renderFailed) {
    return (
      <div className={className || 'mermaid-fallback-container'}>
        <img 
          src={imageToShow} 
          alt={alt || 'Diagram (fallback image)'} 
          className="mermaid-fallback-image"
        />
        <div className="mermaid-fallback-notice">
          <em><small>Please note that the diagram couldn't be rendered, probably due to a <a href="https://mermaid.js.org/">Mermaid.js</a> issue. A static image is displayed instead.</small></em>
        </div>
      </div>
    );
  }
  
  // Use the mermaid class that Docusaurus expects to process
  const uniqueClass = `mermaid-container-${chartFile.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <div className={`${className || 'mermaid-container'} ${uniqueClass}`}>
      <div className="mermaid">
        {chartContent}
      </div>
    </div>
  );
}