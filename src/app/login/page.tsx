'use client';

import { useUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="mb-4 inline-block" />
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
            Sign in to your Vault
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your personal knowledge universe awaits.
          </p>
        </div>

        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton />
      </div>
    </div>
  );
}
