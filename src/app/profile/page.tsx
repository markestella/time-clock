import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });

  if (!user) {
    redirect('/auth/login');
  }
  
  const backUrl = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
           <Button variant="ghost" size="sm" className="absolute top-4 left-4" asChild>
             <Link href={backUrl}>
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back
             </Link>
           </Button>
           <div className="flex flex-col items-center gap-2">
            <Image
              src="/thynetwork-logo.png"
              alt="ThyNetwork Logo"
              width={64}
              height={64}
            />
            <CardTitle className="text-2xl pt-2">Manage Your Profile</CardTitle>
            <CardDescription>
              Update your personal details and PIN here.
            </CardDescription>
           </div>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}