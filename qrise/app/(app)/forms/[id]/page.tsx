"use client";

import { use, useEffect, useState } from "react";
import { FormBuilder } from "@/components/form-builder";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditFormPageProps {
  params: Promise<{ id: string }>;
}

export default function EditFormPage({ params: paramsPromise }: EditFormPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/forms/${params.id}`);
        if (!res.ok) throw new Error("Form not found");
        const json = await res.json();
        
        // Transform fieldsSchema from string to object if necessary
        const data = json.data || json;
        if (typeof data.fieldsSchema === 'string') {
          data.fields = JSON.parse(data.fieldsSchema);
        } else {
          data.fields = data.fieldsSchema;
        }
        
        setInitialData(data);
      } catch (err) {
        console.error(err);
        router.push("/forms");
      } finally {
        setIsLoading(false);
      }
    }
    fetchForm();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <FormBuilder 
      initialData={initialData} 
      onClose={() => router.push("/forms")} 
    />
  );
}
