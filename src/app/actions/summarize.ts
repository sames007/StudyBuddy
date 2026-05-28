'use server';

import { summarizeNotes as summarizeNotesFlow } from '@/ai/flows/summarize-notes';
import { MAX_SUMMARY_CHARS } from '@/lib/limits';
import { z } from 'zod';

const schema = z.object({
  notes: z
    .string()
    .trim()
    .min(10, 'Please provide more text to summarize.')
    .max(
      MAX_SUMMARY_CHARS,
      `Notes are too long. Please keep them under ${MAX_SUMMARY_CHARS.toLocaleString()} characters.`
    ),
});

type State = {
  summary?: string;
  error?: string;
  notes?: string;
};

export async function summarizeNotes(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = schema.safeParse({
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.notes?.[0] || 'Invalid input.',
    };
  }

  const { notes } = validatedFields.data;

  try {
    const response = await summarizeNotesFlow({ notes });
    return { summary: response.summary, notes: notes };
  } catch (e: unknown) {
    console.error('AI Flow error:', e);
    return { error: e instanceof Error ? e.message : 'Failed to summarize notes. The AI service may be temporarily unavailable.' };
  }
}
