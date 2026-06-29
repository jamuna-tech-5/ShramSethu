import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, Wallet, Briefcase, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  const navLinks = user?.role === 'WORKER'
    ? [
        { label: 'Dashboard', href: '/worker/dashboard' },
        { label: 'Find Jobs', href: '/jobs' },
        { label: 'Earnings', href: '/worker/earnings' },
        { label: 'Schemes', href: '/schemes' },
        { label: 'Loans', href: '/worker/loans' }
      ]
    : user?.role === 'CUSTOMER'
    ? [
        { label: 'Dashboard', href: '/customer/dashboard' },
        { label: 'Post Job', href: '/customer/post-job' },
        { label: 'Find Workers', href: '/jobs' }
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-navy-dark/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">ShramSethu</span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Wallet Balance */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hidden sm:flex"
                  onClick={() => navigate('/wallet')}
                >
                  <Wallet className="w-4 h-4 mr-1.5" />
                  {formatCurrency(user?.wallet?.balance || 0)}
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white/80 hover:text-white"
                  onClick={() => navigate('/profile')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-white gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-sm">{user?.fullName?.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Wallet className="w-4 h-4 mr-2" /> Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/documents')}>
                      <Briefcase className="w-4 h-4 mr-2" /> Documents
                    </DropdownMenuItem>
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="w-4 h-4 mr-2" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" className="bg-brand hover:bg-brand-dark text-white" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && isAuthenticated && (
          <div className="md:hidden py-2 border-t border-white/10">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-white/70 hover:text-white px-3 py-2 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}