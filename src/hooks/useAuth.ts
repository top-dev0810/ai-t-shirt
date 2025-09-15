'use client';

import React, { createContext, useContext } from 'react';
import { signIn, signOut, useSession, SessionProvider } from 'next-auth/react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(SessionProvider, null, (
    React.createElement(AuthInnerProvider, null, children)
  ));
}

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const mappedUser: User | null = session?.user ? {
    id: session.user.email ?? 'unknown',
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    avatar: session.user.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name ?? 'User')}&background=6366f1&color=fff`
  } : null;

  const value: AuthContextType = {
    user: mappedUser,
    login: () => signIn('google', {
      callbackUrl: '/',
      prompt: 'select_account',
      redirect: true
    }),
    logout: () => signOut({ callbackUrl: '/', redirect: true }),
    isLoading: status === 'loading',
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
