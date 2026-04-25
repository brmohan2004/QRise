"use client";

import { FormBuilder } from "@/components/form-builder";
import { useRouter } from "next/navigation";

export default function FormBuilderPage() {
  const router = useRouter();

  return (
    <FormBuilder 
      onClose={() => router.push("/forms")} 
    />
  );
}
