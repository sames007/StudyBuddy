export type Flashcard = {
  front: string;
  back: string;
};

export type QuizQuestion = {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  answer: string;
  explanation: string;
};

export type TutorMessage = {
  role: 'user' | 'assistant';
  content: string;
};
