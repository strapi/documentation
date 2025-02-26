// src/components/DocusaurusMermaidFileFallback.js
import React, { useEffect, useState, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import Icon from './Icon'

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
  const imgRef = useRef(null);
  const mermaidContainerRef = useRef(null);
  
  // Determine which image to display based on the current theme
  const imageToShow = colorMode === 'dark' && fallbackImageDark 
    ? fallbackImageDark 
    : fallbackImage;
  
  // Download link component
  const DownloadLink = () => {
    const linkText = colorMode === 'dark' ? 'Download diagram (dark version)' : 'Download diagram (light version)';
    const linkHref = colorMode === 'dark' && fallbackImageDark ? fallbackImageDark : fallbackImage;
    
    return (
      <div className="mermaid-download-link">
        <small>
          <Icon name="download" />
          <a href={linkHref} download target="_blank">{linkText}</a>
        </small>
      </div>
    );
  };

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
  
  // Force Mermaid to use the current theme when it renders
  useEffect(() => {
    // When content is loaded or theme changes, we'll need to re-render Mermaid
    if (!isLoading && chartContent && mermaidContainerRef.current) {
      const renderMermaidWithTheme = async () => {
        try {
          // Dynamically import mermaid to ensure it's loaded in the browser
          const mermaid = (await import('mermaid')).default;
          
          // Initialize mermaid with the current theme
          mermaid.initialize({
            startOnLoad: false,
            theme: colorMode === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
          });
          
          // Clear previous content
          const mermaidDiv = mermaidContainerRef.current.querySelector('.mermaid');
          if (mermaidDiv) {
            mermaidDiv.innerHTML = chartContent;
            
            // Run mermaid to render the diagram
            await mermaid.run({
              nodes: [mermaidDiv],
            });
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          setRenderFailed(true);
        }
      };
      
      renderMermaidWithTheme();
      
      // Also set a timeout to check if rendering was successful
      const timer = setTimeout(() => {
        if (mermaidContainerRef.current) {
          const mermaidDiv = mermaidContainerRef.current.querySelector('.mermaid');
          if (
            !mermaidDiv.querySelector('svg') || 
            mermaidDiv.textContent.includes('Syntax error') ||
            mermaidDiv.querySelector('.error-icon')
          ) {
            setRenderFailed(true);
          }
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [chartContent, isLoading, colorMode]);

  // Initialize zoom on the fallback image
  useEffect(() => {
    if (renderFailed && imgRef.current) {
      import('medium-zoom').then((module) => {
        const mediumZoom = module.default;
        try {
          const zoom = mediumZoom(imgRef.current, {
            margin: 24,
            background: 'rgba(0, 0, 0, 0.7)',
            scrollOffset: 0,
          });
          
          return () => {
            zoom.detach();
          };
        } catch (error) {
          console.error('Failed to apply zoom:', error);
        }
      }).catch(error => {
        console.error('Failed to import medium-zoom:', error);
      });
    }
  }, [renderFailed]);
  
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
          ref={imgRef}
          src={imageToShow} 
          alt={alt || 'Diagram (fallback image)'} 
          className="mermaid-fallback-image medium-zoom-image" 
          data-zoomable="true"
          style={{ cursor: 'zoom-in' }}
        />
        <div className="mermaid-fallback-notice">
          <em><small>Please note that the diagram couldn't be rendered, probably due to a <a href="https://mermaid.js.org/">Mermaid.js</a> issue. A static image is displayed instead.</small></em>
        </div>
        <DownloadLink />
      </div>
    );
  }
  
  // Use the mermaid class that Docusaurus expects to process
  const uniqueClass = `mermaid-container-${chartFile.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <div 
      ref={mermaidContainerRef}
      className={`${className || 'mermaid-container'} ${uniqueClass}`}
    >
      <div className="mermaid">
        {chartContent}
      </div>
      <DownloadLink />
    </div>
  );
}