import { Globe, Shuffle, Lock, Layers, Grid3X3, LucideIcon } from "lucide-react";
import type { QRType } from "@/types/qr.types";

export interface QRTypeItem {
  type: QRType;
  name: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
  color?: string;
}

export const qrTypesList: QRTypeItem[] = [
  {
    type: "url",
    name: "Website URL",
    icon: Globe,
    description: "Websites & Socials",
    badge: "Popular",
    color: "emerald",
  },
  {
    type: "smart_routing",
    name: "Smart Routing",
    icon: Shuffle,
    description: "Device & Time Routing",
    badge: "Dynamic",
    color: "blue",
  },
  {
    type: "password",
    name: "Password Gate",
    icon: Lock,
    description: "PIN & Passcode Protect",
    badge: "Secure",
    color: "amber",
  },
  {
    type: "multi_action",
    name: "Multi-Action",
    icon: Layers,
    description: "Link Menu & Social Hub",
    badge: "Page",
    color: "purple",
  },
  {
    type: "bulk",
    name: "Bulk Generator",
    icon: Grid3X3,
    description: "Batch CSV / Excel",
    badge: "Batch",
    color: "rose",
  },
];

export function getQRTypeInfo(type?: QRType | null): QRTypeItem {
  const match = qrTypesList.find((item) => item.type === type);
  return match || qrTypesList[0];
}
