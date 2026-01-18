import {
  LayoutDashboard,
  Bot,
  FileText,
  BrainCircuit,
  GraduationCap,
  History,
  Book,
} from 'lucide-react';

export const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/tutor',
    label: 'AI Tutor',
    icon: Bot,
  },
  {
    href: '/summarizer',
    label: 'Note Summarizer',
    icon: FileText,
  },
  {
    href: '/flashcards',
    label: 'Flashcards',
    icon: BrainCircuit,
  },
  {
    href: '/quiz',
    label: 'Quiz Generator',
    icon: GraduationCap,
  },
  {
    href: '/book-search',
    label: 'Book Search',
    icon: Book,
  },
  {
    href: '/history',
    label: 'Study History',
    icon: History,
  },
];
