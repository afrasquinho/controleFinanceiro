# 🔥 Configuração do Firebase

Este documento explica como o Firebase está configurado no projeto de Controle Financeiro.

## 📁 Ficheiros de Configuração

### 1. `src/firebase.js`
Ficheiro principal de configuração do Firebase que:
- Inicializa o Firebase com as configurações do ambiente
- Configura todos os serviços (Firestore, Auth, Storage, Functions, Analytics)
- Suporta emuladores para desenvolvimento
- Inclui tratamento de erros robusto

### 2. `src/config/firebaseConfig.js`
Ficheiro de utilitários que fornece:
- Funções helper para operações CRUD no Firestore
- Funções helper para autenticação
- Constantes para nomes de coleções
- Utilitários para formatação e validação

### 3. `firestore.rules`
Regras de segurança do Firestore que:
- Protegem dados do usuário
- Validam entrada de dados
- Garantem que apenas usuários autenticados acessem seus dados
- Incluem validação de tipos e limites

### 4. `firestore.indexes.json`
Índices do Firestore para otimizar consultas:
- Índices compostos para consultas por usuário e mês
- Índices para ordenação por valor
- Índices para consultas por categoria

### 5. `firebase.json`
Configuração do projeto Firebase que:
- Configura hosting
- Define regras de cache
- Configura emuladores para desenvolvimento
- Inclui headers de segurança

## 🔧 Variáveis de Ambiente

As seguintes variáveis devem estar configuradas nos ficheiros `.env`:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyAbR1oVfUjYsyTwhCurqDWvV05QF_VIP9s
REACT_APP_FIREBASE_AUTH_DOMAIN=controlefinanceiro-694b8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=controlefinanceiro-694b8
REACT_APP_FIREBASE_STORAGE_BUCKET=controlefinanceiro-694b8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=749261073531
REACT_APP_FIREBASE_APP_ID=1:749261073531:web:85e6ee8c92155b0b3dc6de
REACT_APP_FIREBASE_MEASUREMENT_ID=G-3WYL3CY7XE
```

## 🚀 Como Usar

### Importar o Firebase
```javascript
import { db, auth, storage, functions, analytics } from './firebase.js';
import { firestoreHelpers, authHelpers, COLLECTIONS } from './config/firebaseConfig.js';
```

### Operações CRUD
```javascript
// Criar um documento
const docId = await firestoreHelpers.create(COLLECTIONS.GASTOS, {
  descricao: 'Compras no supermercado',
  valor: 50.00,
  categoria: 'alimentacao',
  data: new Date()
});

// Ler um documento
const gasto = await firestoreHelpers.read(COLLECTIONS.GASTOS, docId);

// Atualizar um documento
await firestoreHelpers.update(COLLECTIONS.GASTOS, docId, {
  valor: 55.00
});

// Deletar um documento
await firestoreHelpers.delete(COLLECTIONS.GASTOS, docId);
```

### Autenticação
```javascript
// Fazer login
const user = await authHelpers.signIn('email@example.com', 'password');

// Criar conta
const newUser = await authHelpers.signUp('email@example.com', 'password', 'Nome do Usuário');

// Fazer logout
await authHelpers.signOut();

// Escutar mudanças de autenticação
authHelpers.onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuário logado:', user.email);
  } else {
    console.log('Usuário deslogado');
  }
});
```

### Consultas
```javascript
// Buscar gastos por categoria
const gastosAlimentacao = await firestoreHelpers.query(
  COLLECTIONS.GASTOS,
  [{ field: 'categoria', operator: '==', value: 'alimentacao' }],
  'timestamp',
  'desc'
);

// Buscar gastos de um mês específico
const gastosJaneiro = await firestoreHelpers.query(
  COLLECTIONS.GASTOS,
  [
    { field: 'userId', operator: '==', value: currentUser.uid },
    { field: 'mesId', operator: '==', value: 'jan' }
  ]
);
```

### Listeners em Tempo Real
```javascript
// Escutar mudanças em tempo real
const unsubscribe = firestoreHelpers.subscribe(
  COLLECTIONS.GASTOS,
  (gastos) => {
    console.log('Gastos atualizados:', gastos);
  },
  [{ field: 'userId', operator: '==', value: currentUser.uid }]
);

// Parar de escutar
unsubscribe();
```

## 🛡️ Segurança

### Regras do Firestore
- Apenas usuários autenticados podem acessar dados
- Usuários só podem acessar seus próprios dados
- Email deve estar verificado
- Validação de tipos e limites nos dados

### Validações
- Valores monetários: 0 a 1.000.000
- Strings: tamanho máximo definido
- Meses: apenas valores válidos (jan, fev, etc.)
- Dias trabalhados: 0 a 31

## 🔧 Desenvolvimento

### Emuladores
Para usar emuladores em desenvolvimento, adicione ao `.env`:
```env
REACT_APP_USE_FIREBASE_EMULATORS=true
```

### Comandos Úteis
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto
firebase init

# Executar emuladores
firebase emulators:start

# Fazer deploy das regras
firebase deploy --only firestore:rules

# Fazer deploy do hosting
firebase deploy --only hosting
```

## 📊 Estrutura de Dados

### Coleções Principais
- `gastos/{userId}/{mesId}/{gastoId}` - Gastos variáveis
- `gastosFixos/{userId}/{mesId}/{gastoId}` - Gastos fixos
- `rendimentos/{userId}/{mesId}/{rendimentoId}` - Rendimentos
- `diasTrabalhados/{userId}/{mesId}` - Dias trabalhados
- `users/{userId}` - Dados do usuário
- `settings/{userId}` - Configurações do usuário
- `categories/{categoryId}` - Categorias (públicas)

### Estrutura de um Gasto
```javascript
{
  id: "gasto123",
  descricao: "Compras no supermercado",
  valor: 50.00,
  categoria: "alimentacao",
  data: "2025-01-15",
  timestamp: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚨 Troubleshooting

### Erro de Configuração
Se receber erro de configuração, verifique:
1. Variáveis de ambiente estão definidas
2. Ficheiro `.env` está na raiz do projeto
3. Firebase está instalado: `npm install firebase`

### Erro de Permissão
Se receber erro de permissão:
1. Verifique se o usuário está autenticado
2. Verifique se o email está verificado
3. Verifique as regras do Firestore

### Erro de Conexão
Se receber erro de conexão:
1. Verifique a conexão com a internet
2. Verifique se o projeto Firebase está ativo
3. Verifique as configurações do projeto

## 📚 Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
