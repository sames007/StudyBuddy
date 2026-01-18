'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Bot,
  FileText,
  BrainCircuit,
  GraduationCap,
  Loader2,
  Trash2,
  MessageSquarePlus,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Flashcard, QuizQuestion, TutorMessage } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteHistoryItem } from '@/app/actions/history';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type HistoryItem = {
  id: string;
  createdAt: Date;
} & (
  | { type: 'tutor'; topic: string; messages: TutorMessage[] }
  | { type: 'summaries'; summary: string; notes: string }
  | { type: 'flashcards'; topic: string; flashcards: Flashcard[] }
  | { type: 'quizzes'; topic: string; score?: string; quiz: QuizQuestion[] }
);

function formatHistoryDate(date: Date) {
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return date.toLocaleDateString();
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return `Just now`;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setLoading(false);
      setError("Please log in to see your history.");
      return;
    }

    const studiesCollection = collection(db, 'studies');
    const q = query(
      studiesCollection,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc') 
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as HistoryItem;
        });
        setHistory(items);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        console.error('Firestore error:', err);
        if (
          (err.code === 'permission-denied' || err.code === 'unauthenticated')
        ) {
          setError("You don't have permission to view this history. This is likely a security rule misconfiguration or an authentication issue.")
        } else if (
          err.code === 'failed-precondition' &&
          err.message.includes('requires an index')
        ) {
          setError(
            'Your study history database is being prepared. Please check back in a few minutes. You may need to create a composite index in your Firestore console.'
          );
        } else {
          setError("An unexpected error occurred while fetching your history.");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsAlertOpen(true);
  };
  
  const handleViewClick = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const result = await deleteHistoryItem(itemToDelete);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else {
      toast({
        title: 'Success',
        description: 'History item deleted.',
      });
    }
    setIsAlertOpen(false);
    setItemToDelete(null);
  };
  
  const handleContinueTutor = () => {
    if (selectedItem?.type !== 'tutor') return;
    // Pass the conversation data through query params
    const messages = JSON.stringify(selectedItem.messages);
    const conversationId = selectedItem.id;
    router.push(`/tutor?conversationId=${conversationId}&messages=${encodeURIComponent(messages)}`);
  };

  const filteredHistory = (type: string) =>
    history.filter((item) => item.type === type);

  const renderItem = (item: HistoryItem) => {
    let icon, title;
    switch (item.type) {
      case 'tutor':
        icon = <Bot className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
        title = (
          <p className="font-medium truncate" title={item.topic}>
            Conversation about: {item.topic}
          </p>
        );
        break;
      case 'summaries':
        icon = (
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        );
        title = (
          <p className="font-medium truncate" title={item.notes}>
            Summary of notes starting with: "{item.notes.substring(0, 50)}..."
          </p>
        );
        break;
      case 'flashcards':
        icon = (
          <BrainCircuit className="h-5 w-5 text-muted-foreground" />
        );
        title = (
          <p className="font-medium">
            {item.topic} ({item.flashcards.length} cards)
          </p>
        );
        break;
      case 'quizzes':
        icon = <GraduationCap className="h-5 w-5 text-muted-foreground" />;
        title = (
          <p className="font-medium">
            {item.topic} ({item.quiz.length} questions)
          </p>
        );
        break;
    }
    return (
       <li key={item.id} className="group flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-secondary/50">
        <button onClick={() => handleViewClick(item)} className="flex items-center gap-3 overflow-hidden text-left flex-grow">
          {icon}
          {title}
        </button>
        <div className="flex items-center shrink-0 ml-4">
            <p className="text-sm text-muted-foreground shrink-0">{formatHistoryDate(item.createdAt)}</p>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleViewClick(item)}
            >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">View item</span>
            </Button>
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteClick(item.id)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete item</span>
            </Button>
        </div>
      </li>
    );
  };
  
  if (loading || authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study History</CardTitle>
          <CardDescription>
            Review your past questions, summaries, flashcards, and quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study History</CardTitle>
          <CardDescription>
            Review your past questions, summaries, flashcards, and quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Study History</CardTitle>
          <CardDescription>
            Review your past questions, summaries, flashcards, and quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tutor" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tutor">AI Tutor</TabsTrigger>
              <TabsTrigger value="summaries">Summaries</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            <TabsContent value="tutor" className="mt-4">
              <ul className="space-y-3">
                {filteredHistory('tutor').length > 0 ? (
                  filteredHistory('tutor').map(renderItem)
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    No AI Tutor history yet.
                  </p>
                )}
              </ul>
            </TabsContent>
            <TabsContent value="summaries" className="mt-4">
              <ul className="space-y-3">
                {filteredHistory('summaries').length > 0 ? (
                  filteredHistory('summaries').map(renderItem)
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    No summary history yet.
                  </p>
                )}
              </ul>
            </TabsContent>
            <TabsContent value="flashcards" className="mt-4">
              <ul className="space-y-3">
                {filteredHistory('flashcards').length > 0 ? (
                  filteredHistory('flashcards').map(renderItem)
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    No flashcard history yet.
                  </p>
                )}
              </ul>
            </TabsContent>
            <TabsContent value="quizzes" className="mt-4">
              <ul className="space-y-3">
                {filteredHistory('quizzes').length > 0 ? (
                  filteredHistory('quizzes').map(renderItem)
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    No quiz history yet.
                  </p>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              item from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Item Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl">
              {selectedItem && (
                  <>
                      <DialogHeader>
                          <DialogTitle>History Details</DialogTitle>
                          <DialogDescription>
                              {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)} from {formatHistoryDate(selectedItem.createdAt)}
                          </DialogDescription>
                      </DialogHeader>

                      <ScrollArea className="max-h-[60vh] pr-6">
                         <div className="space-y-4">
                          {selectedItem.type === 'tutor' && (
                              <div className="space-y-4">
                                  {selectedItem.messages.map((message, index) => (
                                      <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                          {message.role === 'assistant' && <Avatar className="h-8 w-8 border"><AvatarFallback><Bot size={20} /></AvatarFallback></Avatar>}
                                          <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                          </div>
                                          {message.role === 'user' && user && <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.[0]}</AvatarFallback></Avatar>}
                                      </div>
                                  ))}
                              </div>
                          )}
                           {selectedItem.type === 'summaries' && (
                              <div className="space-y-4">
                                <div><h4 className="font-semibold mb-2">Summary</h4><div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">{selectedItem.summary}</div></div>
                                <Separator/>
                                <div><h4 className="font-semibold mb-2">Original Notes</h4><div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">{selectedItem.notes}</div></div>
                              </div>
                          )}
                          {selectedItem.type === 'flashcards' && (
                            <div className="space-y-2">
                                {selectedItem.flashcards.map((card, index) => (
                                    <div key={index} className="p-3 border rounded-md">
                                        <p className="font-semibold">Q: {card.front}</p>
                                        <p className="text-muted-foreground">A: {card.back}</p>
                                    </div>
                                ))}
                            </div>
                          )}
                          {selectedItem.type === 'quizzes' && (
                              <div className="space-y-3">
                                  {selectedItem.score && <p className="font-bold text-lg text-center">Score: {selectedItem.score}</p>}
                                  {selectedItem.quiz.map((q, index) => (
                                      <div key={index} className="p-3 border rounded-md">
                                          <p className="font-semibold">{index+1}. {q.question}</p>
                                          {q.options && <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">{q.options.map(opt => <li key={opt}>{opt}</li>)}</ul>}
                                          <p className="text-sm mt-2"><span className="font-semibold">Answer:</span> {q.answer}</p>
                                          <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                          </div>
                      </ScrollArea>
                      
                      <DialogFooter>
                          {selectedItem.type === 'tutor' && (
                            <Button onClick={handleContinueTutor}>
                              <MessageSquarePlus className="mr-2 h-4 w-4" />
                              Continue this Conversation
                            </Button>
                          )}
                          <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                          </DialogClose>
                      </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
}
