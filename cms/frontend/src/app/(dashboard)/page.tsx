import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here is an overview of your content and recent activity."
      />
      <DashboardContent />
    </div>
  );
}
