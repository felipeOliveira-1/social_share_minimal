require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Article = require('./models/Article');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    console.log('Incoming origin:', origin);
    // Allow all origins or specific ones
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5002'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  exposedHeaders: ['Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));

// Add manual CORS headers for preflight requests
app.options('*', cors(corsOptions));

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "font-src 'self' data:; " +
    "img-src 'self' data:; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "frame-src 'self'"
  );
  next();
});
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Conexão com MongoDB
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Erro: MONGODB_URI não está definido no arquivo .env');
    process.exit(1);
  }

  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // Increased timeout to 30 seconds
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }
};

// Start server only after DB connection
const startServer = async () => {
  await connectDB();
  
  const findAvailablePort = async (port) => {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(findAvailablePort(port + 1)));
      server.listen({ port }, () => {
        server.close(() => resolve(port));
      });
    });
  };

  const availablePort = await findAvailablePort(PORT);
  
  if (availablePort !== PORT) {
    console.warn(`Aviso: Porta ${PORT} está em uso. Usando porta ${availablePort} como alternativa.`);
  }

  const server = app.listen(availablePort, () => {
    console.log(`Servidor rodando na porta ${availablePort}`);
    console.log('Available endpoints:');
    console.log('GET /health');
    console.log('GET /test');
    console.log('GET /api/articles');
    console.log('POST /api/articles');
    console.log('PUT /api/articles/:id');
    console.log('DELETE /api/articles/:id');
  });

  server.on('error', (error) => {
    console.error('Erro no servidor:', error);
    process.exit(1);
  });
};

startServer();

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint - moved to top
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  try {
    const mongoConnected = mongoose.connection.readyState === 1;
    res.status(200).json({ 
      status: 'ok', 
      mongoConnected,
      serverTime: new Date().toISOString(),
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Test endpoint - moved after health check
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.status(200).json({ message: 'Test endpoint working' });
});

// Rotas da API
app.get('/api/articles/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/articles/${req.params.id}`);
    console.log('Request headers:', req.headers);
    console.log('Request IP:', req.ip);
    console.log('Request host:', req.hostname);
    console.log('Request protocol:', req.protocol);
    
    // Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error(`ID inválido: ${req.params.id}`);
      return res.status(400).json({ 
        message: 'ID do artigo inválido',
        receivedId: req.params.id,
        expectedFormat: '24 character hex string'
      });
    }

    console.log('Querying database for article...');
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    console.log('Mongoose connection host:', mongoose.connection.host);
    console.log('Mongoose connection port:', mongoose.connection.port);
    
    const article = await Article.findById(req.params.id).maxTimeMS(30000);
    console.log('Mongoose query executed successfully');
    
    if (!article) {
      console.error(`Artigo não encontrado para ID: ${req.params.id}`);
      return res.status(404).json({ 
        message: 'Artigo não encontrado',
        articleId: req.params.id
      });
    }
    
    console.log('Article found:', {
      id: article._id,
      title: article.title,
      contentLength: article.content?.length || 0
    });
    
    res.json(article);
  } catch (err) {
    console.error('Erro ao buscar artigo:', err);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).maxTimeMS(30000); // Increased timeout
    res.json(articles);
  } catch (err) {
    console.error('Erro ao buscar artigos:', err);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    console.log('Incoming article data:', {
      title: req.body.title,
      contentLength: req.body.content?.length,
      image: req.body.image ? 'present' : 'missing'
    });

    // Validate required fields
    // Validação inicial dos campos obrigatórios
    const requiredFields = ['title', 'content'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando',
        errors: missingFields.map(field => `${field} é obrigatório`),
        requiredFields,
        received: {
          title: !!req.body.title,
          content: !!req.body.content
        }
      });
    }

    // Validação adicional do tamanho dos campos
    const validationErrors = [];
    if (req.body.title.trim().length < 5) {
      validationErrors.push('O título deve ter pelo menos 5 caracteres');
    }
    if (req.body.content.trim().length < 50) {
      validationErrors.push('O conteúdo deve ter pelo menos 50 caracteres');
    }
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Erros de validação',
        errors: validationErrors
      });
    }

    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      image: req.body.image
    });

    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error('Erro ao criar artigo:', {
      message: err.message,
      errors: err.errors,
      stack: err.stack
    });

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Erro de validação',
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.put('/api/articles/:id', async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artigo deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
  console.error(`Route not found: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  res.status(404).json({ 
    error: 'Endpoint not found',
    method: req.method,
    path: req.url,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /test',
      'GET /api/articles',
      'GET /api/articles/:id',
      'POST /api/articles',
      'PUT /api/articles/:id',
      'DELETE /api/articles/:id'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Available endpoints:');
  console.log('GET /health');
  console.log('GET /test');
  console.log('GET /api/articles');
  console.log('POST /api/articles');
  console.log('PUT /api/articles/:id');
  console.log('DELETE /api/articles/:id');
  console.log(`Servidor rodando na porta ${PORT}`);
});
