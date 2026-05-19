import { api } from './api';
import type { AdminTicketFilters, PaginatedResponse, Ticket } from '../types';

export const adminService = {
  async getAdminTickets(filters: AdminTicketFilters = {}): Promise<PaginatedResponse<Ticket>> {
    const params = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      status: filters.status ?? '',
      gameType: filters.gameType ?? '',
      q: filters.q ?? '',
      userId: filters.userId ?? '',
    };
    const response = await api.get<PaginatedResponse<Ticket>>('/admin/tickets', { params });
    return response.data;
  },
};
