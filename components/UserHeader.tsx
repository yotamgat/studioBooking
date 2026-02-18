'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function UserHeader() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') {
    return (
      <div className="h-12 w-32 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link
          href="/auth/signin"
          className="text-white hover:text-purple-200 font-medium"
        >
          התחבר
        </Link>
        <Link
          href="/auth/register"
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
        >
          הירשם
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
      >
        <div className="text-right">
          <div className="text-white font-medium">{session.user.name}</div>
          <div className="text-purple-200 text-xs">{session.user.email}</div>
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
          {session.user.name?.charAt(0).toUpperCase()}
        </div>
        <svg
          className={`w-4 h-4 text-white transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>

            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                פאנל ניהול
              </Link>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                signOut({ callbackUrl: '/auth/signin' });
              }}
              className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              התנתק
            </button>
          </div>
        </>
      )}
    </div>
  );
}
