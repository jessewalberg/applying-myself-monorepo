import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { NavigationProvider } from "@/components/NavigationProvider";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NavigationProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </NavigationProvider>
    </ProtectedRoute>
  );
} 