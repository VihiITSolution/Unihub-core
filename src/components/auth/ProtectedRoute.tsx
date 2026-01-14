'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useDashboardPath } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dashboardPath = useDashboardPath();

  useEffect(() => {
    // Don't check while loading
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/auth/login');
      return;
    }

    // If specific roles are required, check if user has any of them
    if (allowedRoles.length > 0 && user) {
      const hasRequiredRole = allowedRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        // Redirect to their dashboard if they don't have permission
        router.push(dashboardPath);
      }
    }
  }, [isAuthenticated, isLoading, user, hasRole, allowedRoles, requireAuth, router, pathname, dashboardPath]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (when auth is required)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render children if user doesn't have required role
  if (allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
