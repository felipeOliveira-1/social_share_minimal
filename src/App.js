import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Button from './components/Button';
import Card from './components/Card';
import Admin from './pages/Admin';
import Login from './pages/Login';
import AuthRoute from './components/AuthRoute';

function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // First check server health
        try {
          console.log('Checking server health...');
          const healthResponse = await axios.get('http://localhost:5000/health', {
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
        } catch (error) {
          console.error('Erro ao verificar saúde do servidor:', error);
          if (error.response?.status === 404) {
            alert('Endpoint de verificação de saúde não encontrado. Verifique se o servidor está configurado corretamente.');
          } else {
            alert('Erro ao verificar a saúde do servidor. Por favor, verifique se o servidor está rodando.');
          }
          return;
        }

        // Then fetch articles
        const articlesResponse = await axios.get('http://localhost:5000/api/articles', {
          timeout: 30000 // 30 seconds timeout
        });
        setArticles(articlesResponse.data);
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
                        {articles.map((article) => (
                          <div key={article.id} className="border-b border-gray-200 pb-6">
                            <h3 className="text-2xl font-bold mb-2">{article.title}</h3>
                            {article.image && (
                              <img 
                                src={article.image}
                                alt={article.title}
                                className="my-4 rounded-lg shadow-md max-w-full h-auto"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <p className="text-gray-700 whitespace-pre-line">
                              {article.content}
                            </p>
                          </div>
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
                </div>
              </main>
            </>
          } />
          <Route path="/login" element={<Login />} />
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
