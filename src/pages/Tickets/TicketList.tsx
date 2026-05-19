import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import type { TicketFilters, TicketStatus, GameType } from '../../types';
import {
  formatDate,
  getStatusColor,
  getGameTypeColor,
  GAME_TYPES,
  TICKET_STATUSES,
  extractErrorMessage,
} from '../../utils/helpers';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/Modal';

const gameTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  ...GAME_TYPES.map((g) => ({ value: g, label: g })),
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
];

export function TicketList() {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    pageSize: 10,
    status: '',
    gameType: '',
    q: '',
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { tickets, meta, isLoading, fetchTickets, deleteTicket } = useTickets();

  useEffect(() => {
    fetchTickets(filters);
  }, [filters, fetchTickets]);

  const handleFilterChange = (key: keyof TicketFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteTicket(deleteId);
      setDeleteId(null);
      fetchTickets(filters);
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Boletas</h1>
          <p className="text-gray-500 mt-1">Gestiona todos tus tickets y boletas</p>
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

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nombre o número..."
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
        </div>
      </Card>

      {/* Content */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-3">🎫</div>
            <p className="text-gray-500 font-medium">No hay boletas que mostrar</p>
            <p className="text-gray-400 text-sm mt-1">
              {filters.q || filters.status || filters.gameType
                ? 'Intenta con otros filtros'
                : 'Agrega tu primera boleta usando el botón de arriba'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Título
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Tipo
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Lugar
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Estado
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{ticket.title}</p>
                        {ticket.gameNumber && (
                          <p className="text-xs text-gray-500 mt-0.5">#{ticket.gameNumber}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Badge className={getGameTypeColor(ticket.gameType)}>{ticket.gameType}</Badge>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(ticket.gameDate)}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600 truncate max-w-xs block">{ticket.place}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/tickets/${ticket.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                          <Link to={`/tickets/${ticket.id}/edit`}>
                            <Button variant="secondary" size="sm">Editar</Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteId(ticket.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
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
                  Mostrando {tickets.length} de {meta.total} resultado{meta.total !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      {deleteError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => { setDeleteId(null); setDeleteError(null); }}
        onConfirm={handleDelete}
        title="Eliminar boleta"
        message="¿Estás seguro de que quieres eliminar esta boleta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={deleteLoading}
      />
    </div>
  );
}
