"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { CreateProjectHeader } from "./components/create-project-header";
import { StepProgress } from "./components/step-progress";
import { ProjectInfoStep } from "./components/project-info-step";
import { IndustrySelectStep } from "./components/industry-select-step";
import { TemplateSelectStep } from "./components/template-select-step";

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("Postal & Tracking");
  const [template, setTemplate] = useState("courier-tracking");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate current active step based on filled fields
  const currentStep = !name.trim() ? 1 : !industry ? 2 : 3;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(`Project "${name}" created successfully!`);
      setIsSubmitting(false);
      router.push("/qrise-matrix/projects");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header with Back button, Title & Help */}
      <CreateProjectHeader />

      {/* 2. Top Progress Stepper (Project Info -> Industry -> Template) */}
      <StepProgress currentStep={currentStep} />

      <form onSubmit={handleCreate} className="space-y-5 sm:space-y-6">
        {/* Step 1: Project Information */}
        <ProjectInfoStep
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
        />

        {/* Step 2: Choose an Industry */}
        <IndustrySelectStep
          selectedIndustry={industry}
          onSelectIndustry={setIndustry}
        />

        {/* Step 3: Choose a Project Template */}
        <TemplateSelectStep
          selectedTemplate={template}
          onSelectTemplate={setTemplate}
          selectedIndustry={industry}
        />

        {/* Sticky/Bottom Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <span>Next: Industry Templates</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
