import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Card from '../components/Card';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configure axios to handle larger payloads
axios.defaults.maxContentLength = 100 * 1024 * 1024; // 100MB
axios.defaults.maxBodyLength = 100 * 1024 * 1024; // 100MB

const Admin = ({ articles, setArticles }) => {
  const [currentArticle, setCurrentArticle] = useState({
    id: '',
    title: '',
    content: '',
    image: '',
    published: false
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentArticle({ ...currentArticle, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setCurrentArticle(prev => ({ ...prev, image: 'loading...' }));
      };
      
      reader.onloadend = () => {
        setCurrentArticle(prev => ({ ...prev, image: reader.result }));
      };
      
      reader.onerror = () => {
        alert('Erro ao carregar a imagem');
        setCurrentArticle(prev => ({ ...prev, image: '' }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const quillRef = useRef({
    editor: null,
    wrapper: null
  });

  const handleImageInsert = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          if (quillRef.current.editor) {
            const range = quillRef.current.editor.getSelection();
            if (range) {
              quillRef.current.editor.insertEmbed(range.index, 'image', reader.result);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/--+/g, '-') // Replace multiple - with single -
      .trim();
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    
    // Validação inicial
    const validationErrors = [];
    if (!currentArticle.title || currentArticle.title.trim().length < 5) {
      validationErrors.push('O título deve ter pelo menos 5 caracteres');
    }
    if (!currentArticle.content || currentArticle.content.trim().length < 50) {
      validationErrors.push('O conteúdo deve ter pelo menos 50 caracteres');
    }
    if (validationErrors.length > 0) {
      alert(`Erros de validação:\n${validationErrors.join('\n')}`);
      return;
    }
    
    try {
      // Limpa e valida os dados antes de enviar
      const articleData = {
        title: currentArticle.title.trim(),
        content: currentArticle.content.trim(),
        image: currentArticle.image || null, // Garante que image seja null se estiver vazio
        slug: generateSlug(currentArticle.title),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validação adicional do slug
      if (!articleData.slug || articleData.slug.length < 3) {
        throw new Error('Slug inválido gerado a partir do título');
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:5001/api/articles/${currentArticle._id}`,
          articleData,
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setArticles(articles.map(article => 
          article._id === currentArticle._id ? response.data : article
        ));
      } else {
        response = await axios.post(
          'http://localhost:5001/api/articles',
          articleData,
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setArticles([response.data, ...articles]);
      }
      
      setCurrentArticle({
        title: '',
        content: '',
        image: '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar artigo:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Erro ao salvar artigo. Por favor, tente novamente.';
      
      if (error.response) {
        const responseData = error.response.data;
        
        if (error.response.status === 400) {
          // Trata diferentes formatos de erro 400
          if (Array.isArray(responseData.errors)) {
            errorMessage = `Erros de validação:\n${responseData.errors.join('\n')}`;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else {
            errorMessage = 'Dados inválidos enviados ao servidor. Verifique os campos preenchidos.';
          }
        } else if (error.response.status === 413) {
          errorMessage = 'O arquivo de imagem é muito grande. Por favor, use uma imagem menor que 5MB.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erro no servidor ao salvar artigo. Verifique se o servidor está rodando corretamente.';
        } else {
          errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'A requisição demorou muito para responder. Verifique sua conexão com a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Exibe o erro de forma mais amigável
      alert(`Erro ao salvar artigo:\n\n${errorMessage}\n\nPor favor, verifique os dados e tente novamente.`);
      
      alert(errorMessage);
    }
  };

  const handleEditArticle = (article) => {
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const handleDeleteArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/articles/${id}`);
      setArticles(articles.filter(article => article._id !== id));
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
      alert('Erro ao deletar artigo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Formulário de Artigo */}
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
          </h2>
          <form onSubmit={handleSaveArticle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={currentArticle.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite o título do artigo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conteúdo
              </label>
              <div ref={el => quillRef.current.wrapper = el}>
                <ReactQuill
                  theme="snow"
                  value={currentArticle.content}
                  onChange={(value) => setCurrentArticle({ ...currentArticle, content: value })}
                  ref={el => {
                    if (el) {
                      quillRef.current.editor = el.getEditor();
                    }
                  }}
                modules={{
                  toolbar: {
                    container: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      [{ 'align': [] }],
                      ['clean']
                    ],
                    handlers: {
                      image: handleImageInsert
                    }
                  },
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'link', 'image',
                  'align'
                ]}
                className="mt-1 bg-white rounded-md"
                style={{ minHeight: '300px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagem
              </label>
              <input
                type="file"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {currentArticle.image && (
                <img src={currentArticle.image} alt="Preview" className="mt-2 max-w-xs rounded-md" />
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={() => {
                setCurrentArticle({
                  id: '',
                  title: '',
                  content: '',
                  image: '',
                  published: false
                });
                setIsEditing(false);
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar Artigo' : 'Salvar Artigo'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Lista de Artigos */}
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Artigos Publicados</h2>
          {articles.length === 0 ? (
            <p className="text-gray-600">Nenhum artigo publicado ainda.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article._id} className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                  {article.image && (
                    <img src={article.image} alt={article.title} className="mt-2 max-w-xs rounded-md" />
                  )}
                  <p className="text-gray-600 mt-2">{article.content.substring(0, 100)}...</p>
                  <div className="flex space-x-4 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleEditArticle(article)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteArticle(article._id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Admin;
