'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { generateFlashcards } from '@/app/actions/flashcards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Flashcard } from '@/components/flashcards/flashcard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuthToken } from '@/hooks/use-auth-token';
import { db } from '@/lib/firebase';
import { MAX_FLASHCARDS } from '@/lib/limits';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function FlashcardsPage() {
  const [formState, formAction, isPending] = useActionState(generateFlashcards, {});
  const [numCards, setNumCards] = useState(5);
  const lastSavedFlashcardsRef = useRef<string | null>(null);
  const { user, idToken } = useAuthToken();

  useEffect(() => {
    if (isPending || !formState.flashcards || formState.flashcards.length === 0 || !user) {
      return;
    }

    const saveKey = `${user.uid}:${formState.topic}:${JSON.stringify(formState.flashcards)}`;
    if (lastSavedFlashcardsRef.current === saveKey) {
      return;
    }
    lastSavedFlashcardsRef.current = saveKey;

    const saveToDb = async () => {
      try {
        const studiesCollection = collection(db, 'studies');
        const studyData = {
          userId: user.uid,
          type: 'flashcards' as const,
          topic: formState.topic,
          flashcards: formState.flashcards,
          createdAt: serverTimestamp(),
        };
        await addDoc(studiesCollection, studyData);
      } catch (dbError) {
        console.error("Firestore operation failed:", dbError);
        lastSavedFlashcardsRef.current = null;
      }
    };

    saveToDb();
  }, [isPending, formState.flashcards, formState.topic, user]);


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BrainCircuit /> Flashcard Generator</CardTitle>
          <CardDescription>Enter a topic to generate a set of flashcards.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" placeholder="e.g., Photosynthesis, The Renaissance" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="numberOfCards">Number of Cards: {numCards}</Label>
              <Slider
                id="numberOfCards"
                min={1}
                max={MAX_FLASHCARDS}
                step={1}
                value={[numCards]}
                onValueChange={(value) => setNumCards(value[0])}
              />
              <input type="hidden" name="numberOfCards" value={numCards} />
              <input type="hidden" name="idToken" value={idToken} />
            </div>
            {formState?.error && <p className="text-sm text-destructive">{formState.error}</p>}
            <Button type="submit" disabled={isPending || !idToken} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><BrainCircuit className="mr-2 h-4 w-4" /> Generate Flashcards</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Generating your flashcards...</p>
        </div>
      )}

      {formState.flashcards && formState.flashcards.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 text-center">Your Flashcards on {formState.topic}</h3>
          <Carousel className="w-full max-w-xl mx-auto">
            <CarouselContent>
              {formState.flashcards.map((flashcard, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Flashcard flashcard={flashcard} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}
