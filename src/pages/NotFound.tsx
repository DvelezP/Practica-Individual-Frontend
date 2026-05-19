import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-primary-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La página que buscas no existe o fue movida. Regresa al inicio y sigue explorando.
        </p>
        <Link to="/dashboard">
          <Button size="lg">Ir al dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
