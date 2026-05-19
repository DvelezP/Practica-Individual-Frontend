import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ticketsService } from '../../services/tickets.service';
import type { GameType, TicketStatus } from '../../types';
import { GAME_TYPES, TICKET_STATUSES, extractErrorMessage } from '../../utils/helpers';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const ticketSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  gameType: z.enum(['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'], {
    errorMap: () => ({ message: 'Selecciona un tipo de juego' }),
  }),
  gameNumber: z.string().optional(),
  gameDate: z.string().min(1, 'La fecha es requerida').refine((val) => {
    return !isNaN(Date.parse(val));
  }, 'Fecha inválida'),
  amount: z
    .string()
    .optional()
    .transform((val) => (val === '' || val === undefined ? undefined : Number(val)))
    .pipe(
      z.number({ invalid_type_error: 'El monto debe ser un número' }).positive('El monto debe ser positivo').optional()
    ),
  place: z.string().min(1, 'El lugar es requerido'),
  status: z.enum(['Pendiente', 'Ganado', 'Perdido'], {
    errorMap: () => ({ message: 'Selecciona un estado' }),
  }),
  notes: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const gameTypeOptions = GAME_TYPES.map((g) => ({ value: g, label: g }));
const statusOptions = TICKET_STATUSES.map((s) => ({ value: s, label: s }));

export function TicketForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      status: 'Pendiente',
      gameType: 'Lotería',
    },
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    const loadTicket = async () => {
      setIsLoadingTicket(true);
      try {
        const ticket = await ticketsService.getTicket(Number(id));
        reset({
          title: ticket.title,
          gameType: ticket.gameType,
          gameNumber: ticket.gameNumber ?? '',
          gameDate: ticket.gameDate.split('T')[0],
          amount: ticket.amount !== undefined ? String(ticket.amount) as unknown as number : undefined,
          place: ticket.place,
          status: ticket.status,
          notes: ticket.notes ?? '',
        });
      } catch {
        setServerError('Error al cargar la boleta');
      } finally {
        setIsLoadingTicket(false);
      }
    };
    loadTicket();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: TicketFormData) => {
    setServerError(null);
    try {
      const payload = {
        title: data.title,
        gameType: data.gameType as GameType,
        gameNumber: data.gameNumber || undefined,
        gameDate: data.gameDate,
        amount: data.amount,
        place: data.place,
        status: data.status as TicketStatus,
        notes: data.notes || undefined,
      };

      if (isEdit && id) {
        await ticketsService.updateTicket(Number(id), payload);
        navigate(`/tickets/${id}`);
      } else {
        const ticket = await ticketsService.createTicket(payload);
        navigate(`/tickets/${ticket.id}`);
      }
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar boleta' : 'Nueva boleta'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit ? 'Actualiza los datos de tu boleta' : 'Registra una nueva boleta o ticket'}
        </p>
      </div>

      <Card>
        <CardHeader title={isEdit ? 'Datos de la boleta' : 'Información de la boleta'} />

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="Título *"
            placeholder="Ej: Lotería Nacional enero"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Tipo de juego *"
              options={gameTypeOptions}
              error={errors.gameType?.message}
              {...register('gameType')}
            />

            <Input
              label="Número de boleta"
              placeholder="Ej: 123456"
              error={errors.gameNumber?.message}
              {...register('gameNumber')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Fecha del sorteo *"
              type="date"
              error={errors.gameDate?.message}
              {...register('gameDate')}
            />

            <Input
              label="Monto apostado"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount')}
            />
          </div>

          <Input
            label="Lugar / Organización *"
            placeholder="Ej: Lotería Nacional de México"
            error={errors.place?.message}
            {...register('place')}
          />

          <Select
            label="Estado *"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notas</label>
            <textarea
              rows={3}
              placeholder="Notas adicionales (opcional)..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              {...register('notes')}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1 sm:flex-none">
              {isEdit ? 'Guardar cambios' : 'Crear boleta'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(isEdit ? `/tickets/${id}` : '/tickets')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
