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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1); // Exit if we can't connect to MongoDB
});

// Health check endpoint
app.get('/health', (req, res) => {
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

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

// Rotas da API
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find();
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
