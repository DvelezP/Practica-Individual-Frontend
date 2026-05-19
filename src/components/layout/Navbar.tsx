import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zm6 12H6v-.57c0-.81.48-1.53 1.22-1.85C8.51 16.21 10.19 16 12 16s3.49.21 4.78.58c.74.32 1.22 1.04 1.22 1.85V19z" />
            </svg>
            Mi Boleta
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/tickets" className={navLinkClass}>
              Mis Tickets
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hola, <span className="font-medium text-gray-900">{user?.name}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/tickets"
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              Mis Tickets
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </NavLink>
            )}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
