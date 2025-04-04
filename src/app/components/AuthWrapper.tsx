'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function AuthWrapper({ children, redirectPath = '/users/login' }: AuthWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      router.push(redirectPath);
    }
  }, [router, redirectPath]);

  return <>{children}</>;
}