"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { useRouter } from "next/navigation";

export function useWizard() {
  const router = useRouter();
  const { 
    step, 
    qrType, 
    config, 
    design, 
    isDynamic, 
    setStep, 
    setType, 
    setConfig, 
    setDesign, 
    setDynamic, 
    reset 
  } = useWizardStore();

  const nextStep = () => {
    if (step === 1 && qrType) {
      router.push(`/create/${qrType}`);
    } else if (step === 2) {
      router.push(`/create/design`);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      router.push('/create');
    } else if (step === 3) {
      router.push(`/create/${qrType || 'url'}`);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!qrType;
    if (step === 2) {
      const c = config as { 
        targetUrl?: string; 
        defaultUrl?: string; 
        password?: string; 
        actions?: unknown[]; 
        rows?: unknown[] 
      };
      if (qrType === 'url') return !!c.targetUrl;
      if (qrType === 'smart_routing') return !!c.defaultUrl;
      if (qrType === 'password') return !!c.targetUrl && !!c.password;
      if (qrType === 'multi_action') return Array.isArray(c.actions) && c.actions.length > 0;
      if (qrType === 'bulk') return Array.isArray(c.rows) && c.rows.length > 0;
      return true;
    }
    return true;
  };

  const startNew = () => {
    reset();
    router.push('/create');
  };

  return {
    step,
    qrType,
    config,
    design,
    isDynamic,
    setStep,
    setType,
    setConfig,
    setDesign,
    setDynamic,
    nextStep,
    prevStep,
    canProceed,
    startNew,
    reset,
  };
}