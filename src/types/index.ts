import { ClockEvent, User } from '@prisma/client';

export type UserWithLastEvent = User & {
  clockEvents: ClockEvent[];
};

export type DashboardStats = {
  activeUsers: number;
  clockedInToday: number;
  onBreak: number;
};