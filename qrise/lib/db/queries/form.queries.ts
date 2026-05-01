import { db } from '../index';
import { forms, formSubmissions, type Form, type NewForm, type FormSubmission } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function createForm(data: NewForm): Promise<Form> {
  const result = await db.insert(forms).values(data).returning();
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
  return db.select().from(forms).where(eq(forms.userId, userId)).orderBy(desc(forms.createdAt));
}

export async function submitForm(
  formId: string,
  data: Record<string, unknown>
): Promise<FormSubmission> {
  const result = await db
    .insert(formSubmissions)
    .values({ formId, submissionData: JSON.stringify(data) })
    .returning();
  return result[0];
}