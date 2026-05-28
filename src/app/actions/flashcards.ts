'use server';

import { generateFlashcards as generateFlashcardsFlow } from '@/ai/flows/generate-flashcards';
import { MAX_FLASHCARDS } from '@/lib/limits';
import { requireAuthenticatedUser } from '@/lib/server-auth';
import { z } from 'zod';
import type { Flashcard } from '@/types';

const schema = z.object({
  topic: z.string().trim().min(2, 'Topic must be at least 2 characters.').max(120),
  numberOfCards: z.coerce.number().min(1).max(MAX_FLASHCARDS),
});

type State = {
  flashcards?: Flashcard[];
  error?: string;
  topic?: string;
};

export async function generateFlashcards(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = schema.safeParse({
    topic: formData.get('topic'),
    numberOfCards: formData.get('numberOfCards'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Please ensure the topic is at least 2 characters long.',
    };
  }

  const { topic, numberOfCards } = validatedFields.data;

  try {
    await requireAuthenticatedUser(formData);
    const response = await generateFlashcardsFlow({ topic, numberOfCards });
    return { flashcards: response.flashcards, topic };
  } catch (e: unknown) {
    console.error('AI Flow error:', e);
    return { error: e instanceof Error ? e.message : 'Failed to generate flashcards. The AI service may be temporarily unavailable.' };
  }
}
