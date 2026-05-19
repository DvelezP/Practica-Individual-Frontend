export type GameType =
  | 'Lotería'
  | 'Rifa'
  | 'Sorteo'
  | 'Boleta'
  | 'Juego ocasional';

export type TicketStatus = 'Pendiente' | 'Ganado' | 'Perdido';

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  title: string;
  gameType: GameType;
  gameNumber?: string;
  gameDate: string;
  amount?: number;
  place: string;
  status: TicketStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TicketPayload {
  title: string;
  gameType: GameType;
  gameNumber?: string;
  gameDate: string;
  amount?: number;
  place: string;
  status: TicketStatus;
  notes?: string;
}

export interface TicketFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  gameType?: string;
  q?: string;
}

export interface AdminTicketFilters extends TicketFilters {
  userId?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
