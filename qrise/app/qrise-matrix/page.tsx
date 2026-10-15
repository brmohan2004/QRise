import { Metadata } from "next";
import { OverviewStats } from "./components/overview-stats";
import { OverviewActivityChart } from "./components/overview-activity-chart";
import { OverviewRecentActivity } from "./components/overview-recent-activity";

export const metadata: Metadata = {
  title: "Matrix Overview | QRise Matrix",
  description: "Your industrial barcode telemetry and scan activity at a glance.",
};

export default function MatrixOverviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Key Metrics Cards (QRise Studio StatCard Design) */}
      <OverviewStats />

      {/* 2. Project Activity Spline Chart */}
      <OverviewActivityChart />

      {/* 3. Recent Activity Connected Timeline */}
      <OverviewRecentActivity />
    </div>
  );
}
