import { api } from './api';
import type { PaginatedResponse, Ticket, TicketFilters, TicketPayload } from '../types';

export const ticketsService = {
  async getTickets(filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> {
    const params = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      status: filters.status ?? '',
      gameType: filters.gameType ?? '',
      q: filters.q ?? '',
    };
    const response = await api.get<PaginatedResponse<Ticket>>('/tickets', { params });
    return response.data;
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await api.get<{ data: Ticket }>(`/tickets/${id}`);
    return response.data.data;
  },

  async createTicket(payload: TicketPayload): Promise<Ticket> {
    const response = await api.post<{ data: Ticket }>('/tickets', payload);
    return response.data.data;
  },

  async updateTicket(id: number, payload: Partial<TicketPayload>): Promise<Ticket> {
    const response = await api.put<{ data: Ticket }>(`/tickets/${id}`, payload);
    return response.data.data;
  },

  async deleteTicket(id: number): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },
};
