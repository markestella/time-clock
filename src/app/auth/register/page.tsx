import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4"> 
      <RegisterForm />
      <p className="mt-4 text-center text-sm"> 
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}