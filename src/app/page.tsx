import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BrainCircuit, BookText, GraduationCap, FileText, Bot } from 'lucide-react';

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Tutor Chat',
    description: 'Ask questions in natural language to get simple or advanced explanations for any topic.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Note Summarizer',
    description: 'Paste your notes or upload a text file to get a concise summary of the key points.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Dynamic Flashcards',
    description: 'Automatically generate a set of flashcards for any topic to test your knowledge.',
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: 'Smart Quiz Engine',
    description: 'Create quizzes with a mix of multiple-choice and true/false questions, with instant feedback.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-muted border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Your AI-Powered Learning Partner
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                StudyBuddy is an intelligent, all-in-one study assistant. It leverages AI to provide you with powerful tools to enhance your learning process.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-2xl aspect-video object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
              )}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px.6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">A Smarter Way to Study</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From understanding complex topics to preparing for exams, StudyBuddy has you covered with a suite of intelligent tools.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center bg-card">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="pt-4 text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-sm gap-4">
        <p>&copy; {new Date().getFullYear()} StudyBuddy AI. All rights reserved.</p>
        <div className='hidden sm:block'><Logo /></div>
      </footer>
    </div>
  );
}
