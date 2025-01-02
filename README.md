# Insights de IA e Tecnologia - Plataforma de Compartilhamento de Artigos

Uma plataforma completa para criar, gerenciar e compartilhar artigos sobre Inteligência Artificial e Tecnologia.

## Funcionalidades Principais

✅ Interface administrativa para gerenciamento de artigos  
✅ Validação robusta de conteúdo (título e corpo do artigo)  
✅ Upload de imagens com preview e validação de tamanho  
✅ Ordenação de artigos por data de criação (mais recentes primeiro)  
✅ Layout responsivo com Tailwind CSS  
✅ Autenticação básica para área administrativa  
✅ Tratamento de erros detalhado no frontend e backend  

## Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **React Router 7** - Navegação entre páginas
- **Tailwind CSS 3.3** - Framework CSS utilitário
- **Axios** - Cliente HTTP para chamadas à API
- **UUID** - Geração de IDs únicos para requisições

### Backend
- **Express.js** - Framework Node.js para API REST
- **MongoDB** - Banco de dados NoSQL para armazenamento de artigos
- **Mongoose** - ODM para MongoDB
- **CORS** - Middleware para segurança de requisições entre domínios
- **Dotenv** - Gerenciamento de variáveis de ambiente

## Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/social-share-minimal.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione `MONGODB_URI` com a URL de conexão do MongoDB

4. Inicie o servidor backend:
   ```bash
   node server.js
   ```

5. Inicie o frontend:
   ```bash
   npm start
   ```

6. Acesse no navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
social-share-minimal/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── App.js            # Componente principal
│   ├── App.css           # Estilos globais
│   ├── index.js          # Ponto de entrada
│   └── styles.css        # Estilos adicionais
├── models/               # Modelos do MongoDB
├── server.js             # Servidor backend
├── tailwind.config.js    # Configuração do Tailwind
├── package.json          # Dependências e scripts
└── README.md             # Documentação
```

## Configuração do Tailwind

O projeto utiliza Tailwind CSS com configuração personalizada no arquivo `tailwind.config.js`. As principais configurações incluem:

- Purge CSS para otimização de produção
- Suporte completo para React JSX
- Extensões de tema padrão
- Configurações de cores e espaçamento personalizadas

## Licença

MIT License - veja o arquivo LICENSE para mais detalhes.

## Contribuição

Contribuições são bem-vindas! Siga estas etapas:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Melhorias Futuras

- [ ] Implementar autenticação JWT
- [ ] Adicionar paginação de artigos
- [ ] Criar sistema de categorias/tags
- [ ] Implementar busca de artigos
- [ ] Adicionar suporte a markdown no conteúdo dos artigos
