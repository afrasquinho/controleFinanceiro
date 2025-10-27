import React from 'react';

const Dashboard = ({ user }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🎉 Login com Google Funcionando!</h2>
      <p>Bem-vindo, <strong>{user.displayName || user.email}</strong>!</p>
      <p>✅ Firebase conectado com sucesso</p>
      <p>✅ Google OAuth funcionando</p>
      <p>✅ Usuário autenticado: {user.uid}</p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>📊 Dashboard em Desenvolvimento</h3>
        <p>O dashboard completo será implementado em breve.</p>
        <p>Por enquanto, você pode:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>✅ Fazer login com Google</li>
          <li>✅ Fazer login com email/senha</li>
          <li>✅ Registrar nova conta</li>
          <li>🔄 Dashboard completo (em desenvolvimento)</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
