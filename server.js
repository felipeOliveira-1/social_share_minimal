require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Article = require('./models/Article');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().maxTimeMS(30000); // Increased timeout
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
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    image: req.body.image
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    method: req.method,
    path: req.url
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
