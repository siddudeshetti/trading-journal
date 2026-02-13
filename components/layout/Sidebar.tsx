// components/layout/Sidebar.tsx
// Navigation sidebar with links to all main pages

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, LayoutDashboard, FileText, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: any;
  profile: any;
}

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
  { name: 'Trades', href: '/trades', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-card m-4 mr-0 rounded-2xl p-6 flex flex-col border-r-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-glow-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">Journal Pro</h1>
          <p className="text-xs text-text-tertiary">Track your edge</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          // Check if current page is active
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-3 px-4">
          {/* User avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/30">
            <span className="text-sm font-semibold text-primary">
              {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          
          {/* User details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {profile?.full_name || 'Trader'}
            </p>
            <p className="text-xs text-text-tertiary truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
