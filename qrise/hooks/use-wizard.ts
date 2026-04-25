"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { useRouter } from "next/navigation";
import type { QRType } from "@/types/qr.types";

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
      if (qrType === 'url') return !!(config as any)?.targetUrl;
      if (qrType === 'smart_routing') return !!(config as any)?.defaultUrl;
      if (qrType === 'password') return !!(config as any)?.targetUrl && !!(config as any)?.password;
      if (qrType === 'multi_action') return (config as any)?.actions?.length > 0;
      if (qrType === 'bulk') return (config as any)?.rows?.length > 0;
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