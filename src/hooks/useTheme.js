import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar tema (light/dark mode)
 * Persiste a preferência do usuário no localStorage
 * Detecta preferência do sistema automaticamente
 * 
 * @returns {Object} Estado e funções do tema
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Verificar localStorage primeiro
    const savedTheme = localStorage.getItem('controle-financeiro-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Padrão: light
    return 'light';
  });

  const [isDark, setIsDark] = useState(theme === 'dark');

  // Aplicar tema no documento
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    
    // Atualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = newTheme === 'dark' ? '#1a1a1a' : '#007bff';
    }
  }, []);

  // Alternar tema
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDark(newTheme === 'dark');
    localStorage.setItem('controle-financeiro-theme', newTheme);
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  // Definir tema específico
  const setThemeMode = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      setIsDark(newTheme === 'dark');
      localStorage.setItem('controle-financeiro-theme', newTheme);
      applyTheme(newTheme);
    }
  }, [applyTheme]);

  // Aplicar tema na inicialização
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Só atualizar se não houver preferência salva
      const savedTheme = localStorage.getItem('controle-financeiro-theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
        setIsDark(systemTheme === 'dark');
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [applyTheme]);

  return {
    theme,
    isDark,
    toggleTheme,
    setThemeMode,
    isLight: !isDark
  };
};
