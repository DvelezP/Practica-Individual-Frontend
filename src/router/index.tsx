import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { TicketList } from '../pages/Tickets/TicketList';
import { TicketForm } from '../pages/Tickets/TicketForm';
import { TicketDetail } from '../pages/Tickets/TicketDetail';
import { Admin } from '../pages/Admin';
import { NotFound } from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/tickets',
            element: <TicketList />,
          },
          {
            path: '/tickets/new',
            element: <TicketForm />,
          },
          {
            path: '/tickets/:id',
            element: <TicketDetail />,
          },
          {
            path: '/tickets/:id/edit',
            element: <TicketForm />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/admin',
            element: <Admin />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
