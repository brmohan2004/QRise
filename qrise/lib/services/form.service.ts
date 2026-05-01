import { db } from '@/lib/db';
import { forms, formSubmissions, type Form, type NewForm, type FormSubmission, type NewFormSubmission } from '@/lib/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { generateShortCode } from '@/lib/short-code';

export async function createForm(
  userId: string,
  data: {
    name: string;
    fieldsSchema: unknown;
    successMessage?: string;
  }
): Promise<Form> {
  const slug = await generateUniqueSlug(data.name);
  
  const result = await db.insert(forms).values({
    userId,
    name: data.name,
    slug,
    fieldsSchema: data.fieldsSchema,
    successMessage: data.successMessage,
  } as NewForm).returning();
  
  return result[0];
}

export async function getFormBySlug(slug: string): Promise<Form | undefined> {
  const result = await db.select().from(forms).where(eq(forms.slug, slug)).limit(1);
  return result[0];
}

export async function getFormById(id: string): Promise<Form | undefined> {
  const result = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
  return result[0];
}

export async function getUserForms(userId: string): Promise<Form[]> {
  return db
    .select()
    .from(forms)
    .where(and(eq(forms.userId, userId), eq(forms.isDeleted, false)))
    .orderBy(desc(forms.createdAt));
}

export async function deleteForm(id: string, userId: string): Promise<void> {
  await db
    .update(forms)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(and(eq(forms.id, id), eq(forms.userId, userId)));
}

export async function bulkDeleteForms(ids: string[], userId: string): Promise<void> {
  await db
    .update(forms)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(and(inArray(forms.id, ids), eq(forms.userId, userId)));
}

export async function submitForm(
  formId: string,
  data: Record<string, unknown>,
  ipHash?: string
): Promise<FormSubmission> {
  const result = await db
    .insert(formSubmissions)
    .values({
      formId,
      submissionData: JSON.stringify(data),
      ipHash,
    } as NewFormSubmission)
    .returning();
  
  return result[0];
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  for (let i = 0; i < 10; i++) {
    const slug = i === 0 ? base : `${base}-${i}`;
    const existing = await db.select().from(forms).where(eq(forms.slug, slug)).limit(1);
    if (existing.length === 0) {
      return slug;
    }
  }
  
  const suffix = generateShortCode().slice(0, 6);
  return `${base}-${suffix}`;
}