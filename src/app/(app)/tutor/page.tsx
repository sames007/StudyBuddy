'use client';

import { useActionState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { askTutor } from '@/app/actions/tutor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { TutorMessage as Message } from '@/types';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useState } from 'react';

type TutorState = {
  messages: Message[];
  conversationId?: string | null;
  error?: string;
  answer?: string;
};

function getInitialStateFromUrl(): TutorState {
  const searchParams = new URLSearchParams(window.location.search);
  const messagesParam = searchParams.get('messages');
  const conversationIdParam = searchParams.get('conversationId');

  if (messagesParam) {
    try {
      const messages = JSON.parse(decodeURIComponent(messagesParam));
      return {
        messages: messages,
        conversationId: conversationIdParam || null,
      };
    } catch (e) {
      console.error("Failed to parse messages from URL", e);
    }
  }

  return { messages: [], conversationId: null };
}


function TutorPageComponent() {
  const { user, loading: authLoading } = useAuth();
  
  const searchParams = useSearchParams();
  const messagesParam = searchParams.get('messages');
  const conversationIdParam = searchParams.get('conversationId');

  const [initialState] = useState(() => {
    if (messagesParam) {
      try {
        const messages = JSON.parse(decodeURIComponent(messagesParam));
        return {
          messages,
          conversationId: conversationIdParam || null,
        };
      } catch (e) {
        console.error("Failed to parse messages from URL", e);
      }
    }
    return { messages: [], conversationId: null };
  });

  const [state, formAction, isPending] = useActionState(askTutor, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialState.conversationId);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [state.messages]);

  // Effect to save to Firestore after the AI responds
  useEffect(() => {
    if (isPending || !state.answer || !user) {
      return;
    }
    
    const userMessage = state.messages[state.messages.length - 2];
    const assistantMessage = state.messages[state.messages.length - 1];

    if (!userMessage || !assistantMessage || assistantMessage.role !== 'assistant') {
      return;
    }

    const saveToDb = async () => {
      try {
        if (conversationId) {
          // Update existing conversation
          const docRef = doc(db, 'studies', conversationId);
          await updateDoc(docRef, {
            messages: arrayUnion(userMessage, assistantMessage),
          });
        } else {
          // Create new conversation
          const studiesCollection = collection(db, 'studies');
          const studyData = {
            userId: user.uid,
            type: 'tutor' as const,
            topic: userMessage.content.substring(0, 50),
            messages: [userMessage, assistantMessage],
            createdAt: serverTimestamp(),
          };
          const docRef = await addDoc(studiesCollection, studyData);
          setConversationId(docRef.id); // Save the new ID for subsequent updates
        }
      } catch (dbError) {
        console.error("Firestore operation failed:", dbError);
      }
    };

    saveToDb();

  }, [isPending, state.answer, state.messages, user, conversationId]);


  const handleFormSubmit = (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question.trim()) return;

    formAction(formData);
    formRef.current?.reset();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  const isFormDisabled = isPending || authLoading || !user;

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" /> AI Tutor
        </CardTitle>
        <CardDescription>Ask me anything about your studies to get started!</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {state.messages.length === 0 && !isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <Bot size={48} className="mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Welcome to the AI Tutor</h3>
                <p>Ask complex questions and get clear, concise answers.</p>
              </div>
            )}
            {state.messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-[80%] prose dark:prose-invert prose-p:my-2 prose-headings:my-2 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && user && (
                  <Avatar className="h-8 w-8">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName ?? ''} />
                    ) : (
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            {state.error && (
               <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                   <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive">
                  Sorry, an error occurred: {state.error}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form ref={formRef} action={handleFormSubmit} className="flex w-full items-center space-x-2">
          <input type="hidden" name="messages" value={JSON.stringify(state.messages)} />
          <input type="hidden" name="conversationId" value={conversationId || ''} />
          <Input id="question" name="question" placeholder={authLoading ? 'Authenticating...' : 'Ask anything...'} autoComplete="off" disabled={isFormDisabled} />
          <Button type="submit" size="icon" disabled={isFormDisabled}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// Wrap the component in Suspense because useSearchParams() requires it.
export default function TutorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TutorPageComponent />
    </Suspense>
  );
}
