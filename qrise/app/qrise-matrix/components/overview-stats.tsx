"use client";

import React from "react";
import { 
  Folder, 
  Barcode, 
  BarChart3, 
  Layers 
} from "lucide-react";
import { StatCard } from "@/components/app/stat-card";

export function OverviewStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <StatCard
        label="Total Projects"
        value={7}
        delta="+16%"
        deltaDirection="up"
        icon={Folder}
      />
      <StatCard
        label="Total Labels"
        value={1248}
        delta="+24%"
        deltaDirection="up"
        icon={Barcode}
      />
      <StatCard
        label="Total Scans"
        value={8642}
        delta="+32%"
        deltaDirection="up"
        icon={BarChart3}
      />
      <StatCard
        label="Active Projects"
        value={5}
        delta="+25%"
        deltaDirection="up"
        icon={Layers}
      />
    </div>
  );
}
