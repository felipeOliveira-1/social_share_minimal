import React from 'react';
import './App.css';
import Button from './components/Button';
import Card from './components/Card';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
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
            <p className="text-gray-600">
              Explore as últimas tendências em inteligência artificial e tecnologia.
            </p>
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
    </div>
  );
}

export default App;
