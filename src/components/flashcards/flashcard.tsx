'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Flashcard as FlashcardType } from '@/types';

interface FlashcardProps {
  flashcard: FlashcardType;
}

export function Flashcard({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div className="perspective-1000 w-full h-64" onClick={handleFlip}>
      <div
        className={cn(
          'relative w-full h-full transform-style-3d transition-transform duration-700 cursor-pointer',
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        <Card className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center p-6 bg-card hover:shadow-lg transition-shadow">
           <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2 rounded-full">
             <Lightbulb className="h-5 w-5" />
           </div>
           <CardContent className="text-center">
            <p className="text-xl font-bold text-card-foreground">{flashcard.front}</p>
           </CardContent>
           <div className="absolute bottom-4 text-sm text-muted-foreground">
             Click to flip
           </div>
        </Card>

        <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center items-center p-6 bg-secondary">
           <CardContent className="text-center">
            <p className="text-lg text-secondary-foreground">{flashcard.back}</p>
           </CardContent>
           <div className="absolute bottom-4 text-sm text-secondary-foreground/80 flex items-center">
             <RotateCcw className="mr-2 h-4 w-4"/> Click to flip back
           </div>
        </Card>
      </div>
    </div>
  );
}
