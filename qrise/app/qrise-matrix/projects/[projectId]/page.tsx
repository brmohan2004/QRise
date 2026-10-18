"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "./components/workspace-header";
import { WorkspaceNavTabs, WorkspaceTab } from "./components/workspace-nav-tabs";
import { WorkspaceStats } from "./components/workspace-stats";
import { ShipmentStatusChart } from "./components/shipment-status-chart";
import { WorkspaceRecentActivity } from "./components/workspace-recent-activity";
import { WorkspaceLabelsList } from "./components/workspace-labels-list";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectWorkspacePage({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  // Format project title from url param
  const formattedTitle = resolvedParams.projectId
    ? resolvedParams.projectId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Courier Tracking";

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Project Workspace Top Header */}
      <WorkspaceHeader
        title={formattedTitle}
        industry="Postal & Tracking"
        description="Track shipments, deliveries and parcel movements."
        status="Active"
      />

      {/* 2. Workspace Navigation Tabs (Overview, My Labels, Create Label, Analytics, Settings) */}
      <WorkspaceNavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab 1: Overview Dashboard (Matching Screenshot) */}
      {activeTab === "overview" && (
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
          {/* 3. 2x2 Metric Cards (Total Shipments, In Transit, Delivered, Total Labels) */}
          <WorkspaceStats />

          {/* 4. Shipment Status Donut Chart & Legend Table */}
          <ShipmentStatusChart />

          {/* 5. Recent Activity Connected Timeline */}
          <WorkspaceRecentActivity />

          {/* 6. My Labels Printable Stickers Preview */}
          <WorkspaceLabelsList projectId={resolvedParams.projectId} />
        </div>
      )}

      {/* Tab 2: My Labels List View */}
      {activeTab === "labels" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <WorkspaceLabelsList projectId={resolvedParams.projectId} />
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <ShipmentStatusChart />
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-3 animate-in fade-in duration-300">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Project Settings & Webhook Routing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure scan telemetry endpoints, team access, and print default margins.
          </p>
        </div>
      )}

      {/* Floating Fixed '+' Button to Add Label */}
      <Link
        href={`/qrise-matrix/projects/${resolvedParams.projectId}/add-label`}
        className="fixed bottom-6 sm:bottom-8 right-5 sm:right-8 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-600/40 flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 outline-none ring-4 ring-white/90 dark:ring-slate-900/90 group cursor-pointer"
        title="Add Label"
        aria-label="Add Label"
      >
        <Plus className="w-6 h-6 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90 group-active:scale-90" />
      </Link>
    </div>
  );
}
