import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { UserDashboardClient } from '@/components/user/UserDashboardClient';
import { redirect } from 'next/navigation';

async function getLastEvent(userId: number) {
  const lastEvent = await prisma.clockEvent.findFirst({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });
  return lastEvent?.type;
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userId = parseInt(session.user.id);
  const lastEvent = await getLastEvent(userId);

  return (
    <main>
      <UserDashboardClient user={session.user} initialLastEvent={lastEvent} />
    </main>
  );
}