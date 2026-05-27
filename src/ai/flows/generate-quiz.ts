/**
 * @fileOverview A flow to generate a quiz for a given topic.
 */

import { generateGeminiJson } from '@/ai/gemini';
import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the quiz.'),
  numberOfQuestions: z.number().min(1).max(10).default(5).describe('The number of questions to generate.'),
});
type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  type: z.enum(['multiple-choice', 'true-false']).describe('The type of question.'),
  options: z.array(z.string()).optional().describe('An array of options for multiple-choice questions.'),
  answer: z.string().describe('The correct answer.'),
  explanation: z.string().describe('A brief explanation of the correct answer.'),
});

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const parsedInput = GenerateQuizInputSchema.parse(input);
  const prompt = `You are an expert educator.
Generate exactly ${parsedInput.numberOfQuestions} quiz questions for this topic: ${parsedInput.topic}.
Use a mix of multiple-choice and true/false questions when appropriate.
For multiple-choice questions, provide exactly 4 options and make the answer exactly match one option.
For true/false questions, set answer to exactly "True" or "False" and omit options.
For every question, provide a brief explanation for the correct answer.

Return a JSON object with one field: quiz.`;

  return generateGeminiJson(prompt, GenerateQuizOutputSchema, {
    type: 'object',
    properties: {
      quiz: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            type: {
              type: 'string',
              enum: ['multiple-choice', 'true-false'],
            },
            options: {
              type: 'array',
              items: { type: 'string' },
            },
            answer: { type: 'string' },
            explanation: { type: 'string' },
          },
          required: ['question', 'type', 'answer', 'explanation'],
        },
      },
    },
    required: ['quiz'],
  });
}
