"use client";

import React, { useState } from "react";
import { 
  Truck, 
  ShoppingCart, 
  HeartPulse, 
  Warehouse, 
  Factory, 
  Apple, 
  Search,
  Plus
} from "lucide-react";
import { ProjectsHeader } from "./components/projects-header";
import { ProjectsFilters } from "./components/projects-filters";
import { ProjectCard, ProjectData } from "./components/project-card";
import { CreateProjectDialog } from "./components/create-project-dialog";
import { Button } from "@/components/ui/button";

const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: "courier-tracking",
    name: "Courier Tracking",
    industry: "Postal & Tracking",
    description: "Track shipments, deliveries and parcel movements.",
    labelsCount: 428,
    scansCount: "2.1k",
    createdAt: "Oct 10, 2024",
    status: "Active",
    icon: Truck,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "product-inventory",
    name: "Product Inventory",
    industry: "Retail & Supermarkets",
    description: "Manage product inventory and stock tracking.",
    labelsCount: 520,
    scansCount: "4.8k",
    createdAt: "Oct 08, 2024",
    status: "Active",
    icon: ShoppingCart,
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "medical-equipment",
    name: "Medical Equipment",
    industry: "Healthcare & Hospitals",
    description: "Track medical equipment and hospital assets.",
    labelsCount: 300,
    scansCount: "1.7k",
    createdAt: "Oct 05, 2024",
    status: "Active",
    icon: HeartPulse,
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "warehouse-logistics",
    name: "Warehouse Logistics",
    industry: "Logistics, Shipping and Warehousing",
    description: "Warehouse operations and goods movement.",
    labelsCount: 890,
    scansCount: "6.4k",
    createdAt: "Oct 01, 2024",
    status: "Active",
    icon: Warehouse,
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "manufacturing-parts",
    name: "Manufacturing Parts",
    industry: "Manufacturing & Automotive",
    description: "Track components and production batches.",
    labelsCount: 126,
    scansCount: "340",
    createdAt: "Sep 28, 2024",
    status: "Draft",
    icon: Factory,
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "food-product-tracking",
    name: "Food Product Tracking",
    industry: "Food, Agriculture and Produce",
    description: "Trace food products and batches.",
    labelsCount: 210,
    scansCount: "980",
    createdAt: "Sep 26, 2024",
    status: "Active",
    icon: Apple,
    iconBg: "bg-lime-50 dark:bg-lime-950/50",
    iconColor: "text-lime-600 dark:text-lime-400",
  },
];

export default function MatrixProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleProjectCreated = (newProject: any) => {
    const fullProject: ProjectData = {
      ...newProject,
      icon: Truck,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    };
    setProjects([fullProject, ...projects]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header */}
      <ProjectsHeader onNewProject={() => setIsCreateOpen(true)} />

      {/* 2. Search Bar */}
      <ProjectsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Projects List */}
      <div className="space-y-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No projects found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or switching categories.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
              }}
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl text-xs font-bold"
            >
              Reset Search
            </Button>
          </div>
        )}
      </div>

      {/* 4. Create Project Modal Dialog */}
      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
