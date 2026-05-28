/**
 * @fileOverview A note summarization AI agent.
 *
 * - summarizeNotes - A function that handles the note summarization process.
 */

import { generateGeminiJson } from '@/ai/gemini';
import { z } from 'zod';

const SummarizeNotesInputSchema = z.object({
  notes: z.string().describe('The notes to summarize.'),
});
type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the notes.'),
});
type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  const parsedInput = SummarizeNotesInputSchema.parse(input);
  const prompt = `You are an expert note summarizer.
Create a concise, accurate summary of the key ideas in these notes. Preserve important terms, dates, formulas, and cause/effect relationships.

Notes:
${parsedInput.notes}

Return a JSON object with one field: summary.`;

  return generateGeminiJson(
    prompt,
    SummarizeNotesOutputSchema,
    {
      type: 'object',
      properties: {
        summary: { type: 'string' },
      },
      required: ['summary'],
    },
    { maxOutputTokens: 900 }
  );
}
