'use server';

import { answerQuestion } from '@/ai/flows/answer-questions-ai-tutor';
import { z } from 'zod';
import type { TutorMessage } from '@/types';

const schema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty.').max(1000),
  messages: z.string().max(20000), // JSON string of TutorMessage[]
  conversationId: z.string().optional(),
});

type State = {
  messages: TutorMessage[];
  error?: string;
  answer?: string;
  conversationId?: string | null;
};

export async function askTutor(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = schema.safeParse({
    question: formData.get('question'),
    messages: formData.get('messages'),
    conversationId: formData.get('conversationId'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: 'Invalid input. Please ensure the question is not empty.',
    };
  }

  const { question, conversationId } = validatedFields.data;

  let history: TutorMessage[] = [];
  try {
    history = JSON.parse(validatedFields.data.messages);
  } catch {
    return { ...prevState, error: 'Invalid message history format.' };
  }
  
  const userMessage: TutorMessage = { role: 'user', content: question };
  const currentMessages = [...history, userMessage];

  // Format history for the AI prompt
  const historyAsString = history.map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const response = await answerQuestion({ question, historyAsString });
    const assistantMessage: TutorMessage = { role: 'assistant', content: response.answer };

    return {
      messages: [...currentMessages, assistantMessage],
      answer: response.answer,
      conversationId: conversationId || prevState.conversationId,
    };

  } catch (aiError: unknown) {
    console.error('askTutor AI action error:', aiError);
    return { 
      messages: currentMessages,
      error: aiError instanceof Error ? aiError.message : 'An unknown error occurred with the AI Tutor. The service may be temporarily unavailable.',
      conversationId: conversationId || prevState.conversationId,
    };
  }
}

    
