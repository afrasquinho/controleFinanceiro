import React from 'react';
import { useTheme } from '../hooks/useTheme.js';

/**
 * Componente para alternar entre tema claro e escuro
 * Inclui animação suave e acessibilidade
 */
const ThemeToggle = ({ className = '', size = 'medium' }) => {
  const { toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    small: 'w-10 h-6',
    medium: 'w-12 h-7',
    large: 'w-14 h-8'
  };

  const toggleSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const translateClasses = {
    small: isDark ? 'translate-x-4' : 'translate-x-0',
    medium: isDark ? 'translate-x-5' : 'translate-x-0',
    large: isDark ? 'translate-x-6' : 'translate-x-0'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        btn btn-secondary relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out
        hover-lift hover-glow
        ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'}
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
      title={`Atualmente: tema ${isDark ? 'escuro' : 'claro'}`}
    >
      {/* Toggle Circle */}
      <span
        className={`
          ${toggleSizeClasses[size]}
          ${translateClasses[size]}
          bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out
          flex items-center justify-center
        `}
      >
        {/* Icon */}
        <span className="text-xs">
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
      
      {/* Background Icons */}
      <span 
        className={`
          absolute left-1 top-1/2 transform -translate-y-1/2 text-xs opacity-0
          transition-opacity duration-300
          ${!isDark ? 'opacity-100' : ''}
        `}
      >
        ☀️
      </span>
      <span 
        className={`
          absolute right-1 top-1/2 transform -translate-y-1/2 text-xs opacity-0
          transition-opacity duration-300
          ${isDark ? 'opacity-100' : ''}
        `}
      >
        🌙
      </span>
    </button>
  );
};

export default ThemeToggle;
