'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import LoginModal from './LoginModal';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, login } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-transparent">
              <Image
                src="/logo.png"
                alt="AI T-Shirt Designer Logo"
                fill
                className="object-contain bg-transparent"
                priority
                style={{
                  background: 'transparent',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white hidden sm:block">
              AI T-Shirt Designer
            </span>
          </Link>
        </div>


        {/* Theme Toggle & User Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block">{user.name}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700" style={{ right: '-20px' }}>
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login with Google
            </button>
          )}
        </div>
      </header>

      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
