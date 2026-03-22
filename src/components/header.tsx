'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const pathname = usePathname();
  const auth = isAuthenticated();
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-semibold" style={{ color: '#000' }}>
            DeepDetect
          </Link>

          {auth && (
            <nav className="hidden md:flex gap-8">
              <Link
                href="/history"
                className={`text-sm ${
                  pathname === '/history' ? 'text-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                Suas Análises
              </Link>

              <Link
                href="/analysis"
                className={`text-sm ${
                  pathname === '/analysis' ? 'text-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                Nova Análise
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {auth ? (
            <>
              {/* Créditos */}
              <Link
                href="/credits"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm text-gray-600">💎</span>
                <span className="text-sm font-medium" style={{ color: '#000' }}>
                  {loading
                    ? '...'
                    : `${user?.tokens ?? 0} crédito${(user?.tokens ?? 0) !== 1 ? 's' : ''}`}
                </span>
              </Link>

              {/* Perfil */}
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
              >
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}