'use client';

import { useAuth } from '@/hooks/use-auth';
import { FeatureCard } from '@/components/dashboard/feature-card';
import { Bot, FileText, BrainCircuit, GraduationCap } from 'lucide-react';

const features = [
  {
    title: 'AI Tutor',
    description: 'Ask complex questions and get clear, concise answers from your personal AI tutor.',
    href: '/tutor',
    icon: <Bot className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Note Summarizer',
    description: 'Transform long lecture notes into key points and summaries in seconds.',
    href: '/summarizer',
    icon: <FileText className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Flashcard Generator',
    description: 'Instantly create flashcards from any topic to supercharge your revision.',
    href: '/flashcards',
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Quiz Generator',
    description: 'Test your knowledge with custom quizzes on any subject matter.',
    href: '/quiz',
    icon: <GraduationCap className="h-10 w-10 text-primary" />,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Student'}!</h2>
        <p className="text-muted-foreground">Ready to start learning? Choose a tool to begin.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}
