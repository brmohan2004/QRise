import fullDocs from "@/data/before-auth/full-docs.json";
import * as endpoints from "./endpoints";
import * as codeExamples from "./code-examples";

export interface DocSection {
  id: string;
  title: string;
  description?: string;
  content?: string;
  sections?: DocSection[];
  endpoint?: Record<string, unknown>;
  examples?: Record<string, unknown>;
}

export const getUnifiedDocs = () => {
  return fullDocs;
};

export const getEndpointData = (id: string) => {
  const upperId = id.toUpperCase().replace(/-/g, "_");
  return (endpoints as Record<string, unknown>)[upperId];
};

export const getExampleData = (id: string) => {
  const upperId = id.toUpperCase().replace(/-/g, "_") + "_EXAMPLES";
  return (codeExamples as Record<string, unknown>)[upperId];
};
