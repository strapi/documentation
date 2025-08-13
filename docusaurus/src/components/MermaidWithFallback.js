import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [shouldRender, setShouldRender] = useState(false);
  const { colorMode } = useColorMode();
  const imgRef = useRef(null);
  const mermaidContainerRef = useRef(null);
  const hasRendered = useRef(false);
  
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

  // Clean and prepare mermaid content
  const cleanMermaidContent = useCallback(() => {
    if (mermaidContainerRef.current) {
      const mermaidDiv = mermaidContainerRef.current.querySelector('.mermaid');
      if (mermaidDiv) {
        // Remove any existing SVG and reset
        mermaidDiv.innerHTML = chartContent;
        mermaidDiv.removeAttribute('data-processed');
        // Remove any mermaid-generated attributes
        const attributes = [...mermaidDiv.attributes];
        attributes.forEach(attr => {
          if (attr.name.startsWith('data-mermaid')) {
            mermaidDiv.removeAttribute(attr.name);
          }
        });
      }
    }
  }, [chartContent]);

  // Load chart content from file
  useEffect(() => {
    if (chartFile) {
      setIsLoading(true);
      setRenderFailed(false);
      hasRendered.current = false;
      
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
          // Trigger initial render attempt
          setShouldRender(true);
        })
        .catch(error => {
          console.error('Error loading Mermaid chart file:', error);
          setRenderFailed(true);
          setIsLoading(false);
        });
    }
  }, [chartFile]);

  // Check if component is in active tab
  const checkIfVisible = useCallback(() => {
    if (!mermaidContainerRef.current) return false;
    
    // Check if the container is actually visible (not in hidden tab)
    const rect = mermaidContainerRef.current.getBoundingClientRect();
    const isInViewport = rect.width > 0 && rect.height > 0;
    
    // Also check if parent tab is active
    const tabPanel = mermaidContainerRef.current.closest('[role="tabpanel"]');
    const isTabActive = tabPanel ? !tabPanel.hasAttribute('hidden') : true;
    
    return isInViewport && isTabActive;
  }, []);

  // Render Mermaid diagram
  const renderMermaidDiagram = useCallback(async () => {
    if (!chartContent || !mermaidContainerRef.current) return;

    // Don't render if not visible or already rendered
    if (!checkIfVisible()) {
      return;
    }

    try {
      console.log('Attempting to render Mermaid diagram...');
      
      // Clean previous content
      cleanMermaidContent();

      // Dynamically import mermaid
      const mermaid = (await import('mermaid')).default;
      
      // Initialize mermaid with current theme
      mermaid.initialize({
        startOnLoad: false,
        theme: colorMode === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
      });

      const mermaidDiv = mermaidContainerRef.current.querySelector('.mermaid');
      if (mermaidDiv && chartContent) {
        // Set content
        mermaidDiv.innerHTML = chartContent;
        
        // Generate unique ID
        const uniqueId = `mermaid-${chartFile.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
        mermaidDiv.id = uniqueId;
        
        // Render the diagram
        await mermaid.run({
          nodes: [mermaidDiv],
        });

        hasRendered.current = true;
        console.log('Mermaid diagram rendered successfully');
      }
    } catch (error) {
      console.error('Mermaid rendering failed:', error);
      setRenderFailed(true);
    }
  }, [chartContent, colorMode, cleanMermaidContent, checkIfVisible, chartFile]);

  // Listen for tab changes and visibility
  useEffect(() => {
    if (!shouldRender || isLoading || renderFailed) return;

    // Initial render attempt
    const initialRender = () => {
      if (checkIfVisible()) {
        renderMermaidDiagram();
      }
    };

    // Small delay for initial render
    const initialTimer = setTimeout(initialRender, 100);

    // Listen for tab changes
    const handleTabChange = () => {
      setTimeout(() => {
        if (checkIfVisible() && !hasRendered.current) {
          hasRendered.current = false; // Reset for re-render
          renderMermaidDiagram();
        }
      }, 50);
    };

    // Listen for clicks on tabs (Docusaurus tab behavior)
    const tabButtons = document.querySelectorAll('[role="tab"]');
    tabButtons.forEach(button => {
      button.addEventListener('click', handleTabChange);
    });

    // Also listen for visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
          handleTabChange();
        }
      });
    });

    const tabPanel = mermaidContainerRef.current?.closest('[role="tabpanel"]');
    if (tabPanel) {
      observer.observe(tabPanel, { attributes: true });
    }

    return () => {
      clearTimeout(initialTimer);
      tabButtons.forEach(button => {
        button.removeEventListener('click', handleTabChange);
      });
      observer.disconnect();
    };
  }, [shouldRender, isLoading, renderFailed, renderMermaidDiagram, checkIfVisible]);

  // Re-render when theme changes
  useEffect(() => {
    if (!isLoading && chartContent && shouldRender && !renderFailed) {
      hasRendered.current = false;
      setTimeout(() => {
        if (checkIfVisible()) {
          renderMermaidDiagram();
        }
      }, 100);
    }
  }, [colorMode, isLoading, chartContent, shouldRender, renderFailed, checkIfVisible, renderMermaidDiagram]);

  // Check for rendering success/failure
  useEffect(() => {
    if (!isLoading && chartContent && shouldRender && !renderFailed) {
      const timer = setTimeout(() => {
        if (mermaidContainerRef.current && checkIfVisible()) {
          const mermaidDiv = mermaidContainerRef.current.querySelector('.mermaid');
          if (mermaidDiv && (
            !mermaidDiv.querySelector('svg') || 
            mermaidDiv.textContent.includes('Syntax error') ||
            mermaidDiv.querySelector('.error-icon')
          )) {
            console.warn('Mermaid rendering appears to have failed, switching to fallback');
            setRenderFailed(true);
          }
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, chartContent, shouldRender, renderFailed, checkIfVisible]);

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