import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 1. Get all clock-out messages as before
  const clockOutMessages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { username: true },
      },
    },
  });

  // 2. Get all clock-in events for today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the current day

  const clockInEvents = await prisma.clockEvent.findMany({
    where: {
      type: 'IN',
      timestamp: {
        gte: today, // Greater than or equal to the start of today
      },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: { username: true },
      },
    },
  });

  // 3. Map both data types into a unified notification format
  const messageNotifications = clockOutMessages.map((msg) => ({
    id: `msg-${msg.id}`,
    type: 'CLOCK_OUT_MESSAGE',
    user: msg.user,
    content: msg.content,
    createdAt: msg.createdAt,
    isRead: msg.isRead,
  }));

  const clockInNotifications = clockInEvents.map((evt) => ({
    id: `evt-${evt.id}`,
    type: 'CLOCK_IN',
    user: evt.user,
    content: `Clocked in for the day.`,
    createdAt: evt.timestamp,
    isRead: true, // Clock-in events don't have a "read" state, so we treat them as read
  }));

  // 4. Combine, sort by date, and return
  const allNotifications = [...messageNotifications, ...clockInNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(allNotifications);
}