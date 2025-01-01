import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Button from './components/Button';
import Card from './components/Card';
import Admin from './pages/Admin';
import Login from './pages/Login';
import AuthRoute from './components/AuthRoute';

function App() {
  const [articles, setArticles] = useState([]);
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
