import React, { useState, useEffect, useCallback } from 'react';

const SmartNotifications = ({ gastosData, rendimentosData }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Analisar dados para gerar notificações inteligentes
  const analyzeData = useCallback(() => {
    const newNotifications = [];
    
    if (!gastosData || typeof gastosData !== 'object') return newNotifications;
    
    const todosGastos = Object.values(gastosData).flat().filter(gasto => 
      gasto && typeof gasto === 'object' && typeof gasto.valor === 'number'
    );
    
    if (todosGastos.length === 0) return newNotifications;

    // Calcular estatísticas
    const totalGastos = todosGastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    const mediaGastos = totalGastos / todosGastos.length;
    const gastosHoje = todosGastos.filter(gasto => {
      const hoje = new Date().toISOString().split('T')[0];
      return gasto.data === hoje;
    });

    // Notificação 1: Gastos do dia
    if (gastosHoje.length > 0) {
      const totalHoje = gastosHoje.reduce((sum, gasto) => sum + gasto.valor, 0);
      newNotifications.push({
        id: 'gastos-hoje',
        tipo: 'info',
        titulo: '💰 Gastos de Hoje',
        mensagem: `Você gastou ${totalHoje.toLocaleString('pt-pt', { style: 'currency', currency: 'EUR' })} hoje em ${gastosHoje.length} transações.`,
        acao: 'Ver detalhes',
        timestamp: new Date()
      });
    }

    // Notificação 2: Gasto alto detectado
    const gastosAltos = todosGastos.filter(gasto => gasto.valor > mediaGastos * 3);
    if (gastosAltos.length > 0) {
      newNotifications.push({
        id: 'gasto-alto',
        tipo: 'warning',
        titulo: '⚠️ Gasto Elevado Detectado',
        mensagem: `Você tem ${gastosAltos.length} gastos acima de ${(mediaGastos * 3).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}.`,
        acao: 'Revisar gastos',
        timestamp: new Date()
      });
    }

    // Notificação 3: Padrão de gastos
    const gastosPorDia = {};
    todosGastos.forEach(gasto => {
      const dia = new Date(gasto.data).getDay();
      if (!gastosPorDia[dia]) gastosPorDia[dia] = 0;
      gastosPorDia[dia] += gasto.valor;
    });

    const diaMaiorGasto = Object.entries(gastosPorDia)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (diaMaiorGasto && diaMaiorGasto[1] > totalGastos * 0.3) {
      const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      newNotifications.push({
        id: 'padrao-semanal',
        tipo: 'info',
        titulo: '📅 Padrão Semanal Identificado',
        mensagem: `Você gasta mais nas ${diasNomes[diaMaiorGasto[0]]}s. Considere planejar melhor suas compras.`,
        acao: 'Ver análise',
        timestamp: new Date()
      });
    }

    // Notificação 4: Meta de orçamento (se configurada)
    const metaOrcamento = 2000; // Exemplo de meta
    if (totalGastos > metaOrcamento * 0.8) {
      newNotifications.push({
        id: 'meta-orcamento',
        tipo: 'warning',
        titulo: '🎯 Meta de Orçamento',
        mensagem: `Você já gastou ${((totalGastos / metaOrcamento) * 100).toFixed(1)}% da sua meta mensal.`,
        acao: 'Ajustar gastos',
        timestamp: new Date()
      });
    }

    // Notificação 5: Oportunidade de economia
    const categorias = {};
    todosGastos.forEach(gasto => {
      const categoria = gasto.categoria || 'outros';
      if (!categorias[categoria]) categorias[categoria] = 0;
      categorias[categoria] += gasto.valor;
    });

    const categoriaMaior = Object.entries(categorias)
      .sort(([,a], [,b]) => b - a)[0];

    if (categoriaMaior && categoriaMaior[1] > totalGastos * 0.4) {
      newNotifications.push({
        id: 'oportunidade-economia',
        tipo: 'success',
        titulo: '💡 Oportunidade de Economia',
        mensagem: `Reduzir 10% dos gastos em ${categoriaMaior[0]} economizaria ${(categoriaMaior[1] * 0.1).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}.`,
        acao: 'Ver sugestões',
        timestamp: new Date()
      });
    }

    return newNotifications;
  }, [gastosData]);

  // Gerar notificações quando os dados mudarem
  useEffect(() => {
    const newNotifications = analyzeData();
    setNotifications(newNotifications);
  }, [analyzeData]);

  // Auto-dismiss das notificações após 5 segundos
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return '💡';
    }
  };

  const getNotificationColor = (tipo) => {
    switch (tipo) {
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="smart-notifications">
      <div className="notifications-container">
        {notifications.slice(0, 3).map(notification => (
          <div
            key={notification.id}
            className="notification-card"
            style={{ borderLeftColor: getNotificationColor(notification.tipo) }}
          >
            <div className="notification-header">
              <div className="notification-icon">{getNotificationIcon(notification.tipo)}</div>
              <div className="notification-content">
                <h4 className="notification-title">{notification.titulo}</h4>
                <p className="notification-message">{notification.mensagem}</p>
                <div className="notification-actions">
                  <button className="notification-action-btn">
                    {notification.acao}
                  </button>
                </div>
              </div>
              <button
                className="notification-close"
                onClick={() => dismissNotification(notification.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão para mostrar mais notificações */}
      {notifications.length > 3 && (
        <div className="show-more-notifications">
          <button
            className="show-more-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {showNotifications ? 'Ocultar' : `Ver mais ${notifications.length - 3} notificações`}
          </button>
        </div>
      )}

      {/* Lista completa de notificações */}
      {showNotifications && notifications.length > 3 && (
        <div className="all-notifications">
          {notifications.slice(3).map(notification => (
            <div
              key={notification.id}
              className="notification-card"
              style={{ borderLeftColor: getNotificationColor(notification.tipo) }}
            >
              <div className="notification-header">
                <div className="notification-icon">{getNotificationIcon(notification.tipo)}</div>
                <div className="notification-content">
                  <h4 className="notification-title">{notification.titulo}</h4>
                  <p className="notification-message">{notification.mensagem}</p>
                  <div className="notification-actions">
                    <button className="notification-action-btn">
                      {notification.acao}
                    </button>
                  </div>
                </div>
                <button
                  className="notification-close"
                  onClick={() => dismissNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartNotifications;
