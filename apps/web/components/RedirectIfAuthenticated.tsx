"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface RedirectIfAuthenticatedProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function RedirectIfAuthenticated({
    children,
    redirectTo = "/dashboard"
}: RedirectIfAuthenticatedProps) {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && userId) {
            router.push(redirectTo);
        }
    }, [isLoaded, userId, router, redirectTo]);

    // Show loading while checking auth or while redirecting
    if (!isLoaded || userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-600">
                        {userId ? "Redirecting to dashboard..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // Only render children if not authenticated
    return <>{children}</>;
} 
