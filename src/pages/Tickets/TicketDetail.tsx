import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ticketsService } from '../../services/tickets.service';
import type { Ticket } from '../../types';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getGameTypeColor,
  extractErrorMessage,
} from '../../utils/helpers';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/Modal';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadTicket = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ticketsService.getTicket(Number(id));
        setTicket(data);
      } catch {
        setError('No se pudo cargar la boleta. Puede que no exista o no tengas acceso.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const handleDelete = async () => {
    if (!ticket) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await ticketsService.deleteTicket(ticket.id);
      navigate('/tickets');
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-gray-600 font-medium">{error ?? 'Boleta no encontrada'}</p>
        <Link to="/tickets" className="mt-4 inline-block">
          <Button variant="secondary">Volver a mis boletas</Button>
        </Link>
      </div>
    );
  }

  const detailItems = [
    { label: 'Tipo de juego', value: <Badge className={getGameTypeColor(ticket.gameType)}>{ticket.gameType}</Badge> },
    { label: 'Estado', value: <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge> },
    { label: 'Fecha del sorteo', value: formatDate(ticket.gameDate) },
    { label: 'Lugar / Organización', value: ticket.place },
    ticket.gameNumber ? { label: 'Número de boleta', value: `#${ticket.gameNumber}` } : null,
    ticket.amount !== undefined ? { label: 'Monto apostado', value: formatCurrency(ticket.amount) } : null,
    { label: 'Registrada el', value: formatDate(ticket.created_at) },
    { label: 'Última actualización', value: formatDate(ticket.updated_at) },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/tickets" className="hover:text-primary-600 transition-colors">
          Mis boletas
        </Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium truncate">{ticket.title}</span>
      </div>

      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 break-words">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              <Badge className={getGameTypeColor(ticket.gameType)}>{ticket.gameType}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/tickets/${ticket.id}/edit`}>
              <Button variant="secondary" size="sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </Button>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detailItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</dt>
              <dd className="text-sm text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>

        {ticket.notes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notas</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.notes}</dd>
          </div>
        )}
      </Card>

      {deleteError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(null); }}
        onConfirm={handleDelete}
        title="Eliminar boleta"
        message={`¿Estás seguro de que quieres eliminar "${ticket.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteLoading}
      />
    </div>
  );
}
