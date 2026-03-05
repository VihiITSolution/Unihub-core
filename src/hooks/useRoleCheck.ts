import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

interface UseRoleCheckOptions {
  requiredRole: UserRole;
  redirectTo?: string;
  requireApproval?: boolean;
}

interface UseRoleCheckResult {
  hasRole: boolean;
  isApproved: boolean;
  isChecking: boolean;
  roleError: string | null;
}

/**
 * Hook to check if user has required role and is approved (if applicable)
 * Automatically redirects to appropriate page if role is missing
 */
export function useRoleCheck({
  requiredRole,
  redirectTo,
  requireApproval = false,
}: UseRoleCheckOptions): UseRoleCheckResult {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const userRoles = user?.roles || [];
    const hasRole = userRoles.includes(requiredRole);

    if (!hasRole) {
      setRoleError(`You need ${requiredRole} role to access this page`);

      // Redirect based on role type
      const roleRedirects: Record<string, string> = {
        tutor: "/student/become-tutor",
        vendor: "/student/become-vendor",
      };

      const targetRedirect =
        redirectTo || roleRedirects[requiredRole] || "/student/dashboard";
      router.push(targetRedirect);
      return;
    }

    // Check approval status for roles that require it
    if (requireApproval) {
      if (requiredRole === "tutor") {
        const isApproved = user?.tutorProfile?.isApproved;
        if (!isApproved) {
          setRoleError("Your tutor application is pending approval");
          router.push("/student/become-tutor");
          return;
        }
      }

      if (requiredRole === "vendor") {
        const isApproved = user?.vendorProfile?.isApproved;
        if (!isApproved) {
          setRoleError("Your vendor profile is pending approval");
          router.push("/student/become-vendor");
          return;
        }
      }
    }

    setIsChecking(false);
  }, [
    user,
    isAuthenticated,
    isLoading,
    requiredRole,
    requireApproval,
    redirectTo,
    router,
  ]);

  const hasRole = user?.roles?.includes(requiredRole) || false;
  const isApproved =
    requiredRole === "tutor"
      ? user?.tutorProfile?.isApproved || false
      : requiredRole === "vendor"
        ? user?.vendorProfile?.isApproved || false
        : true;

  return {
    hasRole,
    isApproved,
    isChecking,
    roleError,
  };
}
