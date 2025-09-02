import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, message } = await req.json();
    const userId = parseInt(session.user.id);

    if (!['IN', 'OUT', 'BREAK_START', 'BREAK_END'].includes(type)) {
      return NextResponse.json({ error: 'Invalid clock type' }, { status: 400 });
    }

    const clockEvent = await prisma.clockEvent.create({
      data: {
        type,
        userId,
      },
    });

    if (type === 'OUT' && message) {
      await prisma.message.create({
        data: {
          content: message,
          clockEventId: clockEvent.id,
          userId,
        },
      });
    }

    return NextResponse.json(clockEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}