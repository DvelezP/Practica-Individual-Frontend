import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ticketsService } from '../services/tickets.service';
import type { Ticket } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDate, getStatusColor, getGameTypeColor, isFutureDate } from '../utils/helpers';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { TicketChart } from '../components/ui/TicketChart';

interface DashboardStats {
  total: number;
  upcoming: number;
  pending: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, upcoming: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await ticketsService.getTickets({ pageSize: 100 });
        const allTickets = result.data;
        setTickets(allTickets);
        setStats({
          total: result.meta.total,
          upcoming: allTickets.filter((t) => isFutureDate(t.gameDate)).length,
          pending: allTickets.filter((t) => t.status === 'Pendiente').length,
        });
      } catch {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total registradas',
      value: stats.total,
      icon: '🎟️',
      color: 'from-primary-500 to-indigo-600',
    },
    {
      label: 'Próximos sorteos',
      value: stats.upcoming,
      icon: '📅',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: '⏳',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Bienvenido, {user?.name} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Aquí tienes un resumen de tus boletas y tickets</p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva boleta
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-4xl font-bold">{card.value}</div>
            <div className="text-white/80 text-sm mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <TicketChart tickets={tickets} />

      {/* Recent tickets */}
      <Card>
        <CardHeader
          title="Historial completo"
          subtitle={`${tickets.length} boleta${tickets.length !== 1 ? 's' : ''} registrada${tickets.length !== 1 ? 's' : ''}`}
          action={
            <Link to="/tickets">
              <Button variant="secondary" size="sm">
                Ver todas
              </Button>
            </Link>
          }
        />

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎫</div>
            <p className="text-gray-500 font-medium">No hay boletas registradas</p>
            <p className="text-gray-400 text-sm mt-1">¡Agrega tu primera boleta!</p>
            <Link to="/tickets/new" className="mt-4 inline-block">
              <Button>Agregar boleta</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 10).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate group-hover:text-primary-700">
                      {ticket.title}
                    </p>
                    <Badge className={getGameTypeColor(ticket.gameType)}>
                      {ticket.gameType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{ticket.place}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.gameDate)}</span>
                  </div>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <svg
                    className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}

            {tickets.length > 10 && (
              <div className="text-center pt-2">
                <Link to="/tickets">
                  <Button variant="ghost" size="sm">
                    Ver {tickets.length - 10} más →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
