"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

interface RedirectIfAuthenticatedProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function RedirectIfAuthenticated({
    children,
    redirectTo = "/dashboard"
}: RedirectIfAuthenticatedProps) {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, redirectTo]);

    // Show loading while checking auth or while redirecting
    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-600">
                        {isAuthenticated ? "Redirecting to dashboard..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Only render children if not authenticated
    return <>{children}</>;
} 