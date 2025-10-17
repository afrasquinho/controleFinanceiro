import React from 'react';

/**
 * Componente de loading moderno com animações suaves
 */
const LoadingSpinner = ({ 
  message = 'Carregando...', 
  size = 'medium',
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const content = (
    <div className={`loading-content ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {message && (
        <p className={`loading-message ${textSizes[size]} text-gray-600 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Componente de skeleton loading para cards
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-subtitle"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text short"></div>
      <div className="skeleton-line skeleton-text"></div>
    </div>
    <div className="skeleton-footer">
      <div className="skeleton-button"></div>
    </div>
  </div>
);

/**
 * Componente de skeleton para lista
 */
export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`skeleton-list ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="skeleton-list-item">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-item-content">
          <div className="skeleton-line skeleton-item-title"></div>
          <div className="skeleton-line skeleton-item-subtitle"></div>
        </div>
        <div className="skeleton-item-action"></div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
