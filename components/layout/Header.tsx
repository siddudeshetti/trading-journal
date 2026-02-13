// components/layout/Header.tsx
// Top header with welcome message and action buttons

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  user: any;
  profile: any;
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="glass-card m-4 mb-0 rounded-2xl p-4 flex items-center justify-between border-b-0">
      {/* Welcome message */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Trader'}
        </h2>
        <p className="text-sm text-text-secondary">
          Track your trades and improve your performance
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* New trade button */}
        <Link
          href="/trades/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Trade
        </Link>

        {/* Notifications (placeholder) */}
        <button className="btn-ghost p-2.5" title="Notifications">
          <Bell className="w-5 h-5" />
        </button>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="btn-ghost p-2.5"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
