'use server';

/**
 * @fileOverview A flow to generate flashcards for a given topic.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return generateFlashcardsFlow(input);
}

const flashcardPrompt = ai.definePrompt({
  name: 'flashcardPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert educator. Generate {{{numberOfCards}}} flashcards for the topic of {{{topic}}}. Each flashcard should have a front and back.\n\nOutput in JSON format:\n`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await flashcardPrompt(input);
    return {
      ...output,
      progress: 'Flashcards have been generated for the given topic.',
    } as GenerateFlashcardsOutput & {progress: string};
  }
);
