import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ticketsService } from '../services/tickets.service';
import type { Ticket } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDate, getStatusColor, getGameTypeColor, isFutureDate } from '../utils/helpers';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { TicketChart } from '../components/ui/TicketChart';

const QUOTES = [
  '¿Y si sí me lo gané? 🤞',
  'La suerte favorece a los preparados 🎯',
  'Cada boleta es una oportunidad 🌟',
  'Hoy puede ser tu día 🍀',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function WinRateMeter({ tickets }: { tickets: Ticket[] }) {
  const won = tickets.filter((t) => t.status === 'Ganado').length;
  const lost = tickets.filter((t) => t.status === 'Perdido').length;
  const resolved = won + lost;
  const rate = resolved === 0 ? 0 : Math.round((won / resolved) * 100);

  const color =
    rate >= 60 ? 'from-emerald-400 to-green-500' :
    rate >= 30 ? 'from-amber-400 to-yellow-500' :
    'from-rose-400 to-red-500';

  const label =
    rate >= 60 ? '¡Vas muy bien! 🔥' :
    rate >= 30 ? 'Sigue intentando 💪' :
    resolved === 0 ? 'Sin resultados aún' : 'La suerte llegará 🍀';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tasa de éxito</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">{rate}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{won} ganados · {lost} perdidos</p>
        </div>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function NextDrawCard({ tickets }: { tickets: Ticket[] }) {
  const upcoming = tickets
    .filter((t) => isFutureDate(t.gameDate) && t.status === 'Pendiente')
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

  const next = upcoming[0];

  if (!next) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-center min-h-[160px]">
        <span className="text-4xl mb-2">📭</span>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sin próximos sorteos</p>
        <Link to="/tickets/new" className="mt-3">
          <Button size="sm" variant="secondary">Agregar boleta</Button>
        </Link>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(next.gameDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link to={`/tickets/${next.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden cursor-pointer"
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Próximo sorteo</span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {daysLeft === 0 ? '¡Hoy!' : daysLeft === 1 ? 'Mañana' : `En ${daysLeft} días`}
            </span>
          </div>
          <p className="text-xl font-black truncate">{next.title}</p>
          <p className="text-purple-200 text-sm mt-1">{next.place}</p>
          <div className="flex items-center gap-3 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full font-medium">{next.gameType}</span>
            <span className="text-purple-200">{formatDate(next.gameDate)}</span>
            {next.gameNumber && (
              <span className="bg-yellow-400/30 text-yellow-200 px-3 py-1 rounded-full font-mono font-bold">
                #{next.gameNumber}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await ticketsService.getTickets({ pageSize: 100 });
        setTickets(result.data);
      } catch {
        setError('Error al cargar los datos');
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

  const total = tickets.length;
  const upcoming = tickets.filter((t) => isFutureDate(t.gameDate)).length;
  const pending = tickets.filter((t) => t.status === 'Pendiente').length;
  const won = tickets.filter((t) => t.status === 'Ganado').length;

  const statCards = [
    { label: 'Total', value: total, icon: '🎟️', bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
    { label: 'Próximos', value: upcoming, icon: '📅', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
    { label: 'Pendientes', value: pending, icon: '⏳', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
    { label: 'Ganados', value: won, icon: '🏆', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* Hero header */}
      <motion.div variants={itemVariants} className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-purple-200 text-sm font-medium mb-1">{quote}</p>
            <h1 className="text-3xl font-black">Hola, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-purple-200 mt-1 text-sm">
              Tienes <span className="text-white font-bold">{total}</span> boleta{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/tickets/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow text-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span> Nueva boleta
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`${card.bg} border ${card.border} rounded-2xl p-5`}
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <div className={`text-3xl font-black ${card.text}`}>{card.value}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1 uppercase tracking-wide">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Next draw + win rate */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Próximo sorteo destacado</p>
          <NextDrawCard tickets={tickets} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Tu rendimiento</p>
          <WinRateMeter tickets={tickets} />
        </div>
      </motion.div>

      {/* Charts */}
      {tickets.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Análisis visual</p>
          <TicketChart tickets={tickets} />
        </motion.div>
      )}

      {/* Recent activity */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Actividad reciente</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{total} boleta{total !== 1 ? 's' : ''} en total</p>
          </div>
          <Link to="/tickets">
            <Button variant="secondary" size="sm">Ver todas →</Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No hay boletas aún</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">¡Registra tu primera boleta para empezar!</p>
            <Link to="/tickets/new" className="mt-4 inline-block">
              <Button>Agregar boleta</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {tickets.slice(0, 8).map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  {/* Timeline dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    ticket.status === 'Ganado' ? 'bg-emerald-400' :
                    ticket.status === 'Perdido' ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {ticket.title}
                      </p>
                      <Badge className={getGameTypeColor(ticket.gameType)}>{ticket.gameType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      <span>{ticket.place}</span>
                      <span>·</span>
                      <span>{formatDate(ticket.gameDate)}</span>
                      {ticket.gameNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono">#{ticket.gameNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <svg className="h-4 w-4 text-gray-300 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}

            {tickets.length > 8 && (
              <div className="px-6 py-4 text-center">
                <Link to="/tickets">
                  <Button variant="ghost" size="sm">Ver {tickets.length - 8} boletas más →</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
