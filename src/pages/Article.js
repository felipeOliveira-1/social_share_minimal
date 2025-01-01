import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/articles/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 5000
        });
        setArticle(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError(`Artigo com ID ${id} não encontrado`);
        } else if (err.code === 'ECONNABORTED') {
          setError('A requisição demorou muito para responder. Verifique sua conexão com a internet.');
        } else if (err.response?.status === 400) {
          setError('ID do artigo inválido');
        } else {
          setError('Erro ao carregar o artigo. Por favor, tente novamente mais tarde.');
        }
        console.error('Erro ao buscar artigo:', {
          message: err.message,
          status: err.response?.status,
          config: err.config,
          stack: err.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/">
            <Button variant="secondary">Voltar para a página inicial</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card className="space-y-6">
          {article.image && (
            <img 
              src={article.image}
              alt={article.title}
              className="w-full h-auto max-h-96 object-cover rounded-lg shadow-md"
            />
          )}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{article.content}</p>
          </div>
          <div className="flex justify-end">
            <Link to="/">
              <Button variant="secondary">Voltar</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Article;
