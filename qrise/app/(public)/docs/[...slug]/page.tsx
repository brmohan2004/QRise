import { getUnifiedDocs, getEndpointData, getExampleData } from "@/lib/docs/unified-data";
import { DocSection } from "@/components/docs/doc-section";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: slugs } = await params;
  const slug = slugs[slugs.length - 1];
  const fullDocs = getUnifiedDocs();
  const data = (fullDocs as any)[slug] || getEndpointData(slug);

  return {
    title: `${data?.title || "Docs"} | QRise API`,
    description: data?.description || "Documentation for QRise API",
  };
}

export default async function DocSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugs } = await params;
  const slug = slugs[slugs.length - 1];
  const fullDocs = getUnifiedDocs();
  
  const data = (fullDocs as any)[slug];
  const endpoint = getEndpointData(slug);
  const examples = getExampleData(slug);

  if (!data && !endpoint) {
    notFound();
  }

  return (
    <DocSection 
      id={slug}
      data={data}
      endpoint={endpoint}
      examples={examples}
    />
  );
}
