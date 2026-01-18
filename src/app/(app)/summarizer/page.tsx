'use client';

import { useActionState, useEffect, useRef, ChangeEvent, useState } from 'react';
import { summarizeNotes } from '@/app/actions/summarize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Wand2, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function SummarizerPage() {
  const [formState, formAction, isPending] = useActionState(summarizeNotes, {});
  const [fileName, setFileName] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Effect to save to Firestore after the AI responds
  useEffect(() => {
    if (isPending || !formState.summary || !formState.notes || !user) {
      return;
    }
    
    const saveToDb = async () => {
      try {
        const studiesCollection = collection(db, 'studies');
        const studyData = {
          userId: user.uid,
          type: 'summaries' as const,
          notes: formState.notes,
          summary: formState.summary,
          createdAt: serverTimestamp(),
        };
        await addDoc(studiesCollection, studyData);
      } catch (dbError) {
        console.error("Firestore operation failed:", dbError);
        // Optionally, show a toast to the user
      }
    };

    saveToDb();

  }, [isPending, formState.summary, formState.notes, user]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if(formRef.current) {
        const notesTextArea = formRef.current.elements.namedItem('notes') as HTMLTextAreaElement;
        if(notesTextArea) {
          notesTextArea.value = await file.text();
        }
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText /> Note Summarizer</CardTitle>
          <CardDescription>Paste your notes or upload a text file to get a concise summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="notes">Your Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Paste your notes here..."
                className="min-h-[300px]"
                required
              />
            </div>
             <div className="grid w-full items-center gap-1.5">
              <Label>Or upload a file</Label>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload .txt or .md
              </Button>
              <input id="file" type="file" ref={fileInputRef} accept=".txt,.md" onChange={handleFileChange} className="hidden" />
              {fileName && <p className="text-sm text-muted-foreground">File selected: {fileName}</p>}
            </div>
            {formState?.error && <p className="text-sm text-destructive">{formState.error}</p>}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</> : <><Wand2 className="mr-2 h-4 w-4" /> Summarize Notes</>}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Your generated summary will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none flex-1">
          {isPending ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : formState.summary ? (
             <div className="bg-muted p-4 rounded-md text-foreground whitespace-pre-wrap h-full overflow-auto">{formState.summary}</div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center bg-muted rounded-lg p-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your summary is waiting to be generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
