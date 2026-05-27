/**
 * @fileOverview An AI tutor that answers questions on any topic.
 *
 * - answerQuestion - A function that answers a question using AI.
 */

import { generateGeminiJson } from '@/ai/gemini';
import { z } from 'zod';

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
  const parsedInput = AnswerQuestionInputSchema.parse(input);
  const prompt = `You are an expert AI tutor. Answer clearly, accurately, and concisely.
If the student asks for help with homework, explain the reasoning instead of only giving the final answer.

This is the conversation history:
${parsedInput.historyAsString || 'No previous messages.'}

The student's new question is:
${parsedInput.question}

Return a JSON object with one field: answer.`;

  return generateGeminiJson(prompt, AnswerQuestionOutputSchema, {
    type: 'object',
    properties: {
      answer: { type: 'string' },
    },
    required: ['answer'],
  });
}
