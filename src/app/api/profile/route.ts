import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { validatePassword } from '@/lib/utils';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { username, email, password } = body;

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (username) {
      dataToUpdate.username = username;
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
      }
      dataToUpdate.email = email;
    }

    if (password) {
      if (!validatePassword(password)) {
        return NextResponse.json({ error: 'PIN does not meet the security requirements.' }, { status: 400 });
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No new information provided to update.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong during the update.' }, { status: 500 });
  }
}