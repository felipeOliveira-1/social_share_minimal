const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true,
    minlength: [5, 'O título deve ter pelo menos 5 caracteres'],
    maxlength: [200, 'O título deve ter no máximo 200 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9áéíóúÁÉÍÓÚâêîôÂÊÎÔãõÃÕçÇ\s\-.,!?]+$/.test(v);
      },
      message: 'O título contém caracteres inválidos'
    }
  },
  content: {
    type: String,
    required: [true, 'O conteúdo é obrigatório'],
    minlength: [50, 'O conteúdo deve ter pelo menos 50 caracteres']
  },
  image: {
    type: String,
    maxlength: 10000000 // ~10MB
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('Article', articleSchema);
