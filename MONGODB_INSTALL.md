# 🍃 Instalação do MongoDB

## 📋 Instruções de Instalação

### Ubuntu/Debian:
```bash
# 1. Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 2. Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Atualizar pacotes
sudo apt-get update

# 4. Instalar MongoDB
sudo apt-get install -y mongodb-org

# 5. Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod

# 6. Verificar status
sudo systemctl status mongod
```

### macOS:
```bash
# Com Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Windows:
1. Baixar do site oficial: https://www.mongodb.com/try/download/community
2. Instalar e configurar como serviço

## 🚀 Alternativa: MongoDB Atlas (Nuvem)

Se preferir não instalar localmente, pode usar MongoDB Atlas (gratuito):

1. **Criar conta**: https://www.mongodb.com/atlas
2. **Criar cluster** gratuito
3. **Obter connection string**
4. **Atualizar** `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/controle-financeiro
   ```

## 🔧 Configuração Rápida

Após instalar o MongoDB:

```bash
# 1. Iniciar MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb/brew/mongodb-community  # macOS

# 2. Testar conexão
mongosh

# 3. Iniciar backend
cd backend
npm run dev

# 4. Testar API
curl http://localhost:5000/health
```

## ✅ Verificação

O script de migração verificará automaticamente:
- ✅ MongoDB instalado
- ✅ Backend configurado
- ✅ Dependências instaladas
- ✅ Ficheiro .env criado

Execute: `node scripts/migrate-to-mongodb.js`
