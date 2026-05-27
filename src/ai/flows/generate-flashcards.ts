/**
 * @fileOverview A flow to generate flashcards for a given topic.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 */

import { generateGeminiJson } from '@/ai/gemini';
import { z } from 'zod';

const GenerateFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate flashcards.'),
  numberOfCards: z.number().min(1).max(20).default(5).describe('The number of flashcards to generate.'),
});

type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().describe('The front side of the flashcard.'),
      back: z.string().describe('The back side of the flashcard.'),
    })
  ).describe('An array of flashcards with front and back content.'),
});

type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  const parsedInput = GenerateFlashcardsInputSchema.parse(input);
  const prompt = `You are an expert educator.
Generate exactly ${parsedInput.numberOfCards} useful study flashcards for this topic: ${parsedInput.topic}.
Make the front side a clear prompt or question and the back side a concise answer.

Return a JSON object with one field: flashcards.`;

  return generateGeminiJson(prompt, GenerateFlashcardsOutputSchema, {
    type: 'object',
    properties: {
      flashcards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            front: { type: 'string' },
            back: { type: 'string' },
          },
          required: ['front', 'back'],
        },
      },
    },
    required: ['flashcards'],
  });
}
