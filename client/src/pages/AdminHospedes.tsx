import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HospedesManager from '@/components/HospedesManager';
import { ArrowLeft } from 'lucide-react';

export default function AdminHospedes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showManager, setShowManager] = useState(true);
  const ADMIN_PASSWORD = '02129356';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Senha incorreta!');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Gerenciador de Hóspedes</h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full">
              Acessar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (!showManager) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Button
          onClick={() => setShowManager(true)}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft size={20} />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <HospedesManager />
    </div>
  );
}
