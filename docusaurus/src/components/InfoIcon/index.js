import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function InfoIcon({ tooltip, className }) {
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const iconElement = iconRef.current;
    const tooltipElement = tooltipRef.current;

    if (!iconElement || !tooltipElement) return;

    const handleMouseEnter = () => {
      const iconRect = iconElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      
      // Trouver la sidebar pour s'aligner à ses bords
      const sidebarElement = iconElement.closest('.theme-doc-sidebar-container');
      const sidebarRect = sidebarElement ? sidebarElement.getBoundingClientRect() : null;
      
      // Position au-dessus de l'icône
      const top = iconRect.top - tooltipRect.height - 8;
      
      // Position à gauche de la sidebar avec un petit padding
      const tooltipLeft = sidebarRect ? sidebarRect.left + 16 : iconRect.left;
      
      // Calculer la position de la flèche pour qu'elle pointe vers l'icône
      const arrowLeft = iconRect.left + (iconRect.width / 2) - tooltipLeft;
      
      tooltipElement.style.top = `${top}px`;
      tooltipElement.style.left = `${tooltipLeft}px`;
      
      // Ajouter/mettre à jour la flèche
      let arrow = tooltipElement.querySelector('.tooltip-arrow');
      if (!arrow) {
        arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';
        tooltipElement.appendChild(arrow);
      }
      
      arrow.style.left = `${Math.max(10, Math.min(arrowLeft, 210))}px`;
    };

    const handleMouseLeave = () => {
      // Reset positioning when not hovering
      tooltipElement.style.top = '';
      tooltipElement.style.left = '';
    };

    iconElement.addEventListener('mouseenter', handleMouseEnter);
    iconElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      iconElement.removeEventListener('mouseenter', handleMouseEnter);
      iconElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!tooltip) return null;
  
  return (
    <span className={clsx('info-icon', className)} ref={iconRef}>
      <i className="ph-fill ph-info info-icon__icon"></i>
      <div 
        ref={tooltipRef}
        className="info-icon__tooltip" 
        dangerouslySetInnerHTML={{ __html: tooltip }}
      />
    </span>
  );
}