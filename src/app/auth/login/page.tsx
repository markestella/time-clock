import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 px-4">
      <LoginForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        © 2025 ThyNetwork Inc. All Rights Reserved
      </p>
    </div>
  );
}