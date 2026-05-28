'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { generateQuiz } from '@/app/actions/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GraduationCap, Loader2, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { MAX_QUIZ_QUESTIONS } from '@/lib/limits';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

function QuizTaker({ quiz, topic, onRestart, score }: { quiz: QuizQuestion[]; topic: string; onRestart: () => void, score: number }) {
  const { user } = useAuth();
  const savedQuizRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!user) return;

    const saveKey = `${user.uid}:${topic}:${score}:${quiz.length}`;
    if (savedQuizRef.current === saveKey) {
      return;
    }
    savedQuizRef.current = saveKey;
    
    const saveToDb = async () => {
      try {
        const studiesCollection = collection(db, 'studies');
        const studyData = {
          userId: user.uid,
          type: 'quizzes' as const,
          topic: topic,
          quiz: quiz,
          score: `${score}/${quiz.length}`, // Storing score as a string
          createdAt: serverTimestamp(),
        };
        await addDoc(studiesCollection, studyData);
      } catch (dbError) {
        console.error("Firestore operation failed:", dbError);
        savedQuizRef.current = null;
      }
    };
    
    saveToDb();
  }, [user, quiz, topic, score]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quiz Complete!</CardTitle>
        <CardDescription>Topic: {topic}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-2xl font-bold">Your Score: {score} / {quiz.length}</p>
        <p className="text-muted-foreground">
          {score / quiz.length >= 0.8 ? 'Great work.' : 'Keep practicing.'}
        </p>
        <Button onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Take Another Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

function QuizSession({ quiz, topic, onComplete }: { quiz: QuizQuestion[]; topic: string; onComplete: (score: number) => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  const currentQuestion = quiz[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    if (selectedAnswer === currentQuestion.answer) {
      setScore(s => s + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= quiz.length) {
      onComplete(score);
    } else {
      setShowResult(false);
      setSelectedAnswer(null);
      setCurrentQuestionIndex(i => i + 1);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quiz: {topic}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {quiz.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="font-semibold text-lg">{currentQuestion.question}</p>
        
        <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={showResult}>
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
          {currentQuestion.type === 'true-false' && (
            <>
              <div className="flex items-center space-x-2"><RadioGroupItem value="True" id="true" /><Label htmlFor="true">True</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="False" id="false" /><Label htmlFor="false">False</Label></div>
            </>
          )}
        </RadioGroup>

        {showResult && (
          <Alert variant={isCorrect ? "default" : "destructive"} className={cn(isCorrect ? "border-green-500 bg-green-500/10 text-green-500" : "border-destructive bg-destructive/10")}>
            {isCorrect ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-destructive" />}
            <AlertTitle>{isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
            <AlertDescription className="text-foreground">{currentQuestion.explanation}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          {showResult ? (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex + 1 >= quiz.length ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>
              Check Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function QuizPage() {
  const [formState, formAction, isPending] = useActionState(generateQuiz, {});
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizState, setQuizState] = useState<'configuring' | 'taking' | 'finished'>('configuring');
  const [finalScore, setFinalScore] = useState(0);
  
  const quiz = useMemo(() => formState.quiz, [formState.quiz]);
  const topic = useMemo(() => formState.topic, [formState.topic]);

  useEffect(() => {
    if (!isPending && quiz && quiz.length > 0) {
      setQuizState('taking');
    }
  }, [isPending, quiz]);

  const handleQuizComplete = (score: number) => {
    setFinalScore(score);
    setQuizState('finished');
  }
  
  const handleRestart = () => {
    setQuizState('configuring');
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8 min-h-[300px] max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Generating your quiz...</p>
        </div>
      </div>
    );
  }
  
  if (quizState === 'taking' && quiz && topic) {
    return <QuizSession quiz={quiz} topic={topic} onComplete={handleQuizComplete} />;
  }

  if (quizState === 'finished' && quiz && topic) {
    return <QuizTaker quiz={quiz} topic={topic} onRestart={handleRestart} score={finalScore} />;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><GraduationCap/> Quiz Generator</CardTitle>
        <CardDescription>Create a quiz to test your knowledge on any subject.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" name="topic" placeholder="e.g., World War II, Cellular Biology" required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="numberOfQuestions">Number of Questions: {numQuestions}</Label>
            <Slider
              id="numberOfQuestions"
              min={1}
              max={MAX_QUIZ_QUESTIONS}
              step={1}
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
            />
            <input type="hidden" name="numberOfQuestions" value={numQuestions} />
          </div>
          {formState?.error && <p className="text-sm text-destructive">{formState.error}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            <GraduationCap className="mr-2 h-4 w-4" /> Generate Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
