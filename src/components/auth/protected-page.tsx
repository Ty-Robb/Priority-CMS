
"use client";

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context'; // No need for useEffect/useRouter here, AuthProvider handles it.
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedPageProps {
  children: ReactNode;
}

export function ProtectedPage({ children }: ProtectedPageProps) {
  const { isLoggedIn, isLoading } = useAuth();

  // isLoading is true during initial Firebase auth check.
  // Once isLoading is false, isLoggedIn will be definitively true or false.
  // AuthProvider's useEffect handles redirection if !isLoggedIn after loading.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (!isLoggedIn && !isLoading) { // Double check, though AuthProvider should redirect
     // This state should ideally not be reached if AuthProvider is working correctly
     // and has already redirected. But as a fallback:
    return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p>Redirecting to login...</p>
        {/* Optionally, a manual redirect here if router isn't available or context is slow, but not ideal */}
      </div>
    );
  }

  // If loading is complete and user is logged in, render children.
  return <>{children}</>;
}
