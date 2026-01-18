'use server';
/**
 * @fileOverview An AI tutor that answers questions on any topic.
 *
 * - answerQuestion - A function that answers a question using AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  historyAsString: z.string().optional().describe('The history of the conversation, formatted as a string.'),
});
type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: AnswerQuestionInputSchema},
  output: {schema: AnswerQuestionOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert AI Tutor. Your role is to answer the user's question clearly and concisely.

This is the conversation history:
{{{historyAsString}}}

The user's new question is: {{{question}}}

Provide a direct answer to the user's question.`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
