import type { NavSection } from './types'

import docsData from "@/data/before-auth/docs.json";

export const NAV_SECTIONS: NavSection[] = (docsData as unknown as { navSections: NavSection[] }).navSections;