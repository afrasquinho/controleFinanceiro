import React, { useState, useEffect } from 'react';

const AccessibilitySettings = () => {
  const [fontSize, setFontSize] = useState('medium');
  const [contrast, setContrast] = useState('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Aplicar configurações de acessibilidade
  useEffect(() => {
    const root = document.documentElement;
    
    // Tamanho da fonte
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'xlarge': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[fontSize]);

    // Contraste
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Movimento reduzido
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Salvar configurações
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-contrast', contrast);
    localStorage.setItem('accessibility-reduced-motion', reducedMotion);
    localStorage.setItem('accessibility-high-contrast', highContrast);
    localStorage.setItem('accessibility-screen-reader', screenReader);

  }, [fontSize, contrast, reducedMotion, highContrast, screenReader]);

  // Carregar configurações salvas
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') || 'medium';
    const savedContrast = localStorage.getItem('accessibility-contrast') || 'normal';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';

    setFontSize(savedFontSize);
    setContrast(savedContrast);
    setReducedMotion(savedReducedMotion);
    setHighContrast(savedHighContrast);
    setScreenReader(savedScreenReader);
  }, []);

  // Detectar preferências do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
    }

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (contrastQuery.matches) {
      setHighContrast(true);
    }
  }, []);

  const resetToDefaults = () => {
    setFontSize('medium');
    setContrast('normal');
    setReducedMotion(false);
    setHighContrast(false);
    setScreenReader(false);
  };

  return (
    <div className="accessibility-settings">
      <div className="settings-header">
        <h2>♿ Configurações de Acessibilidade</h2>
        <p>Personalize a aplicação para melhor experiência de uso</p>
      </div>

      <div className="settings-grid">
        {/* Tamanho da Fonte */}
        <div className="setting-group">
          <label htmlFor="font-size">Tamanho da Fonte:</label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="setting-select"
          >
            <option value="small">Pequeno (14px)</option>
            <option value="medium">Médio (16px)</option>
            <option value="large">Grande (18px)</option>
            <option value="xlarge">Extra Grande (20px)</option>
          </select>
          <div className="setting-preview">
            <span style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'medium' ? '16px' : fontSize === 'large' ? '18px' : '20px' }}>
              Texto de exemplo
            </span>
          </div>
        </div>

        {/* Contraste */}
        <div className="setting-group">
          <label htmlFor="contrast">Contraste:</label>
          <select
            id="contrast"
            value={contrast}
            onChange={(e) => setContrast(e.target.value)}
            className="setting-select"
          >
            <option value="normal">Normal</option>
            <option value="high">Alto</option>
            <option value="dark">Escuro</option>
          </select>
        </div>

        {/* Alto Contraste */}
        <div className="setting-group">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Alto Contraste
          </label>
          <p className="setting-description">
            Aumenta o contraste entre texto e fundo para melhor legibilidade
          </p>
        </div>

        {/* Movimento Reduzido */}
        <div className="setting-group">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Reduzir Movimento
          </label>
          <p className="setting-description">
            Desativa animações e transições para reduzir distrações
          </p>
        </div>

        {/* Modo Leitor de Tela */}
        <div className="setting-group">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={screenReader}
              onChange={(e) => setScreenReader(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            Modo Leitor de Tela
          </label>
          <p className="setting-description">
            Otimiza a interface para leitores de tela e tecnologias assistivas
          </p>
        </div>

        {/* Atalhos de Teclado */}
        <div className="setting-group">
          <h3>⌨️ Atalhos de Teclado</h3>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>1</kbd>
              <span>Ir para Visão Geral</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>2</kbd>
              <span>Ir para Gastos</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>3</kbd>
              <span>Ir para Orçamentos</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>+</kbd>
              <span>Adicionar Gasto</span>
            </div>
            <div className="shortcut-item">
              <kbd>Esc</kbd>
              <span>Fechar Modal</span>
            </div>
            <div className="shortcut-item">
              <kbd>Tab</kbd>
              <span>Navegar entre elementos</span>
            </div>
          </div>
        </div>

        {/* Informações de Acessibilidade */}
        <div className="setting-group">
          <h3>ℹ️ Informações de Acessibilidade</h3>
          <div className="accessibility-info">
            <div className="info-item">
              <strong>Navegação por Teclado:</strong>
              <p>Use Tab para navegar entre elementos e Enter/Space para ativar</p>
            </div>
            <div className="info-item">
              <strong>Leitores de Tela:</strong>
              <p>Compatível com NVDA, JAWS, VoiceOver e outros leitores de tela</p>
            </div>
            <div className="info-item">
              <strong>Alto Contraste:</strong>
              <p>Respeita as preferências do sistema operacional</p>
            </div>
            <div className="info-item">
              <strong>Foco Visível:</strong>
              <p>Indicadores claros de foco para navegação por teclado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="btn btn-secondary"
          onClick={resetToDefaults}
        >
          🔄 Restaurar Padrões
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          ✅ Aplicar Configurações
        </button>
      </div>
    </div>
  );
};

export default AccessibilitySettings;

