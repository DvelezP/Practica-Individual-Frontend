import { useCallback, useEffect, useState } from 'react';
import { ticketsService } from '../services/tickets.service';
import type { PaginationMeta, Ticket, TicketFilters, TicketPayload } from '../types';

interface UseTicketsReturn {
  tickets: Ticket[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  createTicket: (payload: TicketPayload) => Promise<Ticket>;
  updateTicket: (id: number, payload: Partial<TicketPayload>) => Promise<Ticket>;
  deleteTicket: (id: number) => Promise<void>;
}

export function useTickets(initialFilters: TicketFilters = {}): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (filters: TicketFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ticketsService.getTickets(filters);
      setTickets(result.data);
      setMeta(result.meta);
    } catch {
      setError('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (payload: TicketPayload): Promise<Ticket> => {
    const ticket = await ticketsService.createTicket(payload);
    return ticket;
  }, []);

  const updateTicket = useCallback(
    async (id: number, payload: Partial<TicketPayload>): Promise<Ticket> => {
      const ticket = await ticketsService.updateTicket(id, payload);
      return ticket;
    },
    []
  );

  const deleteTicket = useCallback(async (id: number): Promise<void> => {
    await ticketsService.deleteTicket(id);
  }, []);

  useEffect(() => {
    fetchTickets(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { tickets, meta, isLoading, error, fetchTickets, createTicket, updateTicket, deleteTicket };
}
