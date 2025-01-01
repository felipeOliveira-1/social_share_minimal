import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { v4 as uuidv4 } from 'uuid';

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
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setCurrentArticle({ ...currentArticle, image: reader.result });
    };
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveArticle = (e) => {
    e.preventDefault();
    
    // Verifica se o título foi preenchido
    if (!currentArticle.title.trim()) {
      alert('Por favor, insira um título para o artigo');
      return;
    }
    
    if (isEditing) {
      setArticles(articles.map(article => 
        article.id === currentArticle.id ? currentArticle : article
      ));
    } else {
      setArticles([...articles, { ...currentArticle, id: uuidv4() }]);
    }
    
    // Limpa o formulário
    setCurrentArticle({
      id: '',
      title: '',
      content: '',
      image: '',
      published: false
    });
    setIsEditing(false);
  };

  const handleEditArticle = (article) => {
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter(article => article.id !== id));
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
              <textarea
                name="content"
                value={currentArticle.content}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="6"
                required
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
                <div key={article.id} className="border-b border-gray-200 pb-4">
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
                      onClick={() => handleDeleteArticle(article.id)}
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
