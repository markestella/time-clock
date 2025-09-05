import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clockOutMessages = await prisma.message.findMany({
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
          questions: { where: { answer: null } },
        },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const clockInEvents = await prisma.clockEvent.findMany({
    where: { type: 'IN', timestamp: { gte: today } },
    include: { user: { select: { username: true } } },
    orderBy: { timestamp: 'desc' },
  });

  const messageNotifications = clockOutMessages.map((msg) => ({
    id: `msg-${msg.id}`,
    type: 'CLOCK_OUT_MESSAGE' as const,
    data: msg,
    createdAt: msg.createdAt,
  }));

  const clockInNotifications = clockInEvents.map((evt) => ({
    id: `evt-${evt.id}`,
    type: 'CLOCK_IN' as const,
    data: { 
      user: evt.user,
      content: `Clocked in for the day.`,
      createdAt: evt.timestamp,
    },
    createdAt: evt.timestamp,
  }));

  const allNotifications = [...messageNotifications, ...clockInNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(allNotifications);
}