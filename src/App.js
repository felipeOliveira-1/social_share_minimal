import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Button from './components/Button';
import Card from './components/Card';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Article from './pages/Article';
import AuthRoute from './components/AuthRoute';

function App() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // First check server health
        let retries = 3;
        while (retries > 0) {
          try {
            console.log('Checking server health...');
            const healthResponse = await axios.get('http://localhost:5001/health', {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              timeout: 5000
            });
            
            if (!healthResponse.data.mongoConnected) {
              alert('Erro: O servidor não está conectado ao MongoDB. Por favor, verifique a conexão do banco de dados.');
              return;
            }
            break; // Success - exit retry loop
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.error('Erro ao verificar saúde do servidor:', error);
              alert('Não foi possível conectar ao servidor. Por favor:\n1. Verifique se o servidor está rodando\n2. Tente recarregar a página\n3. Entre em contato com o suporte técnico');
              return;
            }
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // Then fetch articles
        const articlesResponse = await axios.get('http://localhost:5001/api/articles', {
          timeout: 30000 // 30 seconds timeout
        });
        // Ordena os artigos do mais recente para o mais antigo
        const sortedArticles = articlesResponse.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setArticles(sortedArticles);
      } catch (error) {
        console.error('Erro ao buscar artigos:', error);
        if (error.code === 'ECONNABORTED') {
          alert('A requisição demorou muito para responder. Verifique sua conexão com a internet.');
        } else if (error.response?.status === 500) {
          alert('Erro no servidor ao buscar artigos. Por favor, verifique se o servidor está rodando corretamente.');
        } else if (error.response?.status === 404) {
          alert('Endpoint da API não encontrado. Verifique se o servidor está configurado corretamente.');
        } else {
          alert('Erro ao carregar artigos. Por favor, tente novamente mais tarde.');
        }
      }
    };

    fetchArticles();
  }, []);
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={
            <>
              <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Insights de IA e Tecnologia
                  </h1>
                </div>
              </header>
              <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Card className="space-y-4">
                    <h2 className="text-xl font-semibold">Bem-vindo ao Insights de IA</h2>
                    {articles.length === 0 ? (
                      <p className="text-gray-600">
                        Explore as últimas tendências em inteligência artificial e tecnologia.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {currentArticles.map((article) => (
                          <Link 
                            to={`/article/${article._id}`} 
                            key={article._id} 
                            className="block border-b border-gray-200 pb-6 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-4">
                              {article.image && (
                                <img 
                                  src={article.image}
                                  alt={article.title}
                                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="text-2xl font-bold mb-2">{article.title}</h3>
                                <p className="text-gray-600 line-clamp-2">
                                  {article.content}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-4">
                      <Button onClick={() => alert('Saiba Mais clicado!')}>
                        Saiba Mais
                      </Button>
                      <Button variant="secondary" onClick={() => alert('Contato clicado!')}>
                        Contato
                      </Button>
                    </div>
                  </Card>
                  {articles.length > articlesPerPage && (
                    <div className="mt-6 flex justify-center">
                      <Button 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        variant="secondary"
                      >
                        Artigos mais antigos
                      </Button>
                    </div>
                  )}
                </div>
              </main>
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/article/:id" element={<Article />} />
          <Route
            path="/admin"
            element={
              <AuthRoute>
                <Admin articles={articles} setArticles={setArticles} />
              </AuthRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
