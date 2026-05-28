'use server';

import { generateQuiz as generateQuizFlow } from '@/ai/flows/generate-quiz';
import { MAX_QUIZ_QUESTIONS } from '@/lib/limits';
import { z } from 'zod';
import type { QuizQuestion } from '@/types';

const schema = z.object({
  topic: z.string().trim().min(2, 'Topic must be at least 2 characters.').max(120),
  numberOfQuestions: z.coerce.number().min(1).max(MAX_QUIZ_QUESTIONS),
});

type State = {
  quiz?: QuizQuestion[];
  topic?: string;
  error?: string;
};


export async function generateQuiz(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = schema.safeParse({
    topic: formData.get('topic'),
    numberOfQuestions: formData.get('numberOfQuestions'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input. Please ensure the topic is at least 2 characters long.' };
  }
  
  const { topic, numberOfQuestions } = validatedFields.data;

  try {
    const response = await generateQuizFlow({ topic, numberOfQuestions });
    
    return {
      quiz: response.quiz,
      topic: topic,
    };
  } catch (e: unknown) {
      console.error('AI Flow error:', e);
      return { error: e instanceof Error ? e.message : 'Failed to generate quiz. The AI service may be temporarily unavailable.' };
  }
}
