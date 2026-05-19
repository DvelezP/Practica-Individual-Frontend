import type { GameType, TicketStatus } from '../types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateInput(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function getStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Ganado: 'bg-green-100 text-green-800',
    Perdido: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export function getGameTypeColor(gameType: GameType): string {
  const colors: Record<GameType, string> = {
    'Lotería': 'bg-purple-100 text-purple-800',
    Rifa: 'bg-blue-100 text-blue-800',
    Sorteo: 'bg-indigo-100 text-indigo-800',
    Boleta: 'bg-pink-100 text-pink-800',
    'Juego ocasional': 'bg-gray-100 text-gray-800',
  };
  return colors[gameType];
}

export function extractErrorMessage(error: unknown): string {
  if (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data !== null &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof (error.response.data as Record<string, unknown>).message === 'string'
  ) {
    return (error.response.data as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export const GAME_TYPES: GameType[] = [
  'Lotería',
  'Rifa',
  'Sorteo',
  'Boleta',
  'Juego ocasional',
];

export const TICKET_STATUSES: TicketStatus[] = ['Pendiente', 'Ganado', 'Perdido'];
