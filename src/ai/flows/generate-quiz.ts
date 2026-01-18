'use server';
/**
 * @fileOverview A flow to generate a quiz for a given topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return generateQuizFlow(input);
}

const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert educator. Generate a quiz with {{{numberOfQuestions}}} questions for the topic of {{{topic}}}. The quiz can contain a mix of multiple-choice and true/false questions.
For multiple-choice questions, provide 4 options.
For every question, provide a brief explanation for the correct answer.

Output in the specified JSON format.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await quizPrompt(input);
    return {
      ...output,
      progress: 'Quiz has been generated for the given topic.',
    } as GenerateQuizOutput & {progress: string};
  }
);
