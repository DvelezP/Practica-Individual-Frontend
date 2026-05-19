import { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import type { AdminTicketFilters, GameType, Ticket, TicketStatus } from '../types';
import {
  formatDate,
  getStatusColor,
  getGameTypeColor,
  GAME_TYPES,
  TICKET_STATUSES,
} from '../utils/helpers';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import type { PaginationMeta } from '../types';

const gameTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  ...GAME_TYPES.map((g) => ({ value: g, label: g })),
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
];

export function Admin() {
  const [filters, setFilters] = useState<AdminTicketFilters>({
    page: 1,
    pageSize: 10,
    status: '',
    gameType: '',
    q: '',
    userId: undefined,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await adminService.getAdminTickets(filters);
        setTickets(result.data);
        setMeta(result.meta);
      } catch {
        setError('Error al cargar los tickets de administración');
      } finally {
        setIsLoading(false);
      }
    };
    loadTickets();
  }, [filters]);

  const handleFilterChange = (key: keyof AdminTicketFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Admin
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        </div>
        <p className="text-gray-500">Visualiza y gestiona todos los tickets del sistema</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar nombre o número..."
            value={filters.q ?? ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
          <Select
            options={gameTypeOptions}
            value={filters.gameType ?? ''}
            onChange={(e) => handleFilterChange('gameType', e.target.value as GameType | '')}
          />
          <Select
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={(e) => handleFilterChange('status', e.target.value as TicketStatus | '')}
          />
          <Input
            placeholder="ID de usuario..."
            type="number"
            min="1"
            value={filters.userId ?? ''}
            onChange={(e) =>
              handleFilterChange('userId', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFilters({ page: 1, pageSize: 10, status: '', gameType: '', q: '', userId: undefined })
            }
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Content */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">No se encontraron tickets</p>
            <p className="text-gray-400 text-sm mt-1">Intenta con otros filtros</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      ID
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Título
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Propietario
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Tipo
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Fecha
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-500">#{ticket.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{ticket.title}</p>
                        {ticket.gameNumber && (
                          <p className="text-xs text-gray-500 mt-0.5">#{ticket.gameNumber}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {ticket.user ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ticket.user.name}</p>
                            <p className="text-xs text-gray-500">{ticket.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            user_id: {ticket.user_id}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Badge className={getGameTypeColor(ticket.gameType)}>{ticket.gameType}</Badge>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(ticket.gameDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="px-6 pb-4">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
                <p className="text-sm text-gray-500 text-center mt-2">
                  Mostrando {tickets.length} de {meta.total} ticket{meta.total !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
