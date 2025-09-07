import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { UserWithLastEvent } from '@/types';

async function getDashboardData() {
  const users: UserWithLastEvent[] = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    orderBy: { createdAt: 'desc' },
    include: {
      clockEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  });

  const unreadMessages = await prisma.message.findMany({
    where: { isRead: false },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { username: true } },
      questions: {
        select: {
          id: true,
          content: true,
          answer: true,
        },
      },
      _count: {
        select: {
          questions: {
            where: { answer: null },
          },
        },
      },
    },
  });

  const activeUsers = users.filter(
    (u) => ['IN', 'BREAK_START', 'BREAK_END'].includes(u.clockEvents[0]?.type)
  ).length;

  const onBreak = users.filter(
    (u) => u.clockEvents[0]?.type === 'BREAK_START'
  ).length;

  return { users, activeUsers, onBreak, unreadMessages };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { users, activeUsers, onBreak, unreadMessages } = await getDashboardData();

  return (
    <main>
      <AdminDashboardClient
        user={session.user}
        initialUsers={users}
        initialStats={{ activeUsers, onBreak, totalEmployees: users.length }}
        initialMessages={unreadMessages}
      />
    </main>
  );
}