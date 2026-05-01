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
  loadQR: (qr: Record<string, unknown>) => void;
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
      loadQR: (qr: Record<string, unknown>) => set({
        editingQrId: qr.id as string,
        name: qr.name as string,
        qrType: qr.type as QRType,
        isDynamic: qr.isDynamic as boolean,
        design: (qr.designConfig as Partial<QRDesign>) || {},
        config: {
          ...qr,
          targetUrl: qr.targetUrl as string,
          rules: qr.routingRules as unknown as unknown[],
          actions: qr.qrActions as unknown as unknown[],
        } as Partial<QRConfig>,
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
          const { logoPublicId: _logoPublicId, logoUrl, ...rest } = state.design;
          void _logoPublicId;
          const cleanDesign = { ...rest };
          if (logoUrl && !logoUrl.startsWith('blob:')) {
            (cleanDesign as Record<string, unknown>).logoUrl = logoUrl;
          }
          state.setDesign(cleanDesign);
        }
      },
    }
  )
);