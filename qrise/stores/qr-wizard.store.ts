import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QRType, QRConfig, QRDesign } from '@/types/qr.types';

interface WizardStore {
  step: 1 | 2 | 3;
  name: string;
  qrType: QRType | null;
  config: Partial<QRConfig>;
  design: Partial<QRDesign>;
  isDynamic: boolean;
  editingQrId: string | null;
  // SECURITY: tempPassword is NOT persisted - only used during wizard flow, cleared on reset
  tempPassword: string | null;
  setName: (name: string) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setType: (type: QRType) => void;
  setConfig: (config: Partial<QRConfig>) => void;
  setDesign: (design: Partial<QRDesign>) => void;
  setDynamic: (isDynamic: boolean) => void;
  setEditingQrId: (id: string | null) => void;
  setTempPassword: (password: string | null) => void;
  loadQR: (qr: any) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  name: "My New QR",
  qrType: null as QRType | null,
  config: {} as Partial<QRConfig>,
  design: {} as Partial<QRDesign>,
  isDynamic: true,
  editingQrId: null as string | null,
  tempPassword: null as string | null,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      ...initialState,
      setName: (name: string) => set({ name }),
      setStep: (step: 1 | 2 | 3) => set({ step }),
      setType: (qrType: QRType) => set({ qrType, step: 2 }),
      setConfig: (config: Partial<QRConfig>) => set((state) => ({ 
        config: { ...state.config, ...config } as Partial<QRConfig>
      })),
      setDesign: (design: Partial<QRDesign>) => set((state) => ({ 
        design: { ...state.design, ...design } as Partial<QRDesign>
      })),
      setDynamic: (isDynamic: boolean) => set({ isDynamic }),
      setEditingQrId: (editingQrId: string | null) => set({ editingQrId }),
      setTempPassword: (tempPassword: string | null) => set({ tempPassword }),
      loadQR: (qr: any) => set({
        editingQrId: qr.id,
        name: qr.name,
        qrType: qr.type,
        isDynamic: qr.isDynamic,
        design: qr.designConfig || {},
        config: {
          ...qr,
          targetUrl: qr.targetUrl,
          rules: qr.routingRules,
          actions: qr.qrActions,
        },
        step: 2,
      }),
      reset: () => set(initialState),
    }),
    {
      name: 'qrise-wizard-draft',
      // SECURITY: Exclude sensitive fields from persistence
      partialize: (state) => ({
        step: state.step,
        name: state.name,
        qrType: state.qrType,
        config: state.config,
        design: {
          ...state.design,
          logoUrl: state.design.logoUrl?.startsWith('blob:') ? undefined : state.design.logoUrl
        },
        isDynamic: state.isDynamic,
        editingQrId: state.editingQrId,
      }),
      onRehydrateStorage: () => (state) => {
        // Clear logoPublicId on rehydration - it's derived from logoUrl, not user input
        if (state?.design) {
          const { logoPublicId, logoUrl, ...rest } = state.design;
          const cleanDesign = { ...rest };
          if (logoUrl && !logoUrl.startsWith('blob:')) {
            (cleanDesign as any).logoUrl = logoUrl;
          }
          state.setDesign(cleanDesign);
        }
      },
    }
  )
);