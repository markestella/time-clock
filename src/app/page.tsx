import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'EMPLOYEE') {
    redirect('/user/dashboard');
  }
  
  redirect('/auth/login');
}