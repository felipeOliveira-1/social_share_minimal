import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Bem-vindo ao Painel Admin</h2>
            <p className="text-gray-600">
              Aqui você pode gerenciar as configurações do sistema.
            </p>
            <div className="flex space-x-4">
              <Button onClick={() => alert('Configurações clicado!')}>
                Configurações
              </Button>
              <Button variant="secondary" onClick={() => alert('Relatórios clicado!')}>
                Relatórios
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
