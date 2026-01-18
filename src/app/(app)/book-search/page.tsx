'use client';

import { useActionState } from 'react';
import { searchBooks } from '@/app/actions/book-search';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Book } from 'lucide-react';
import Image from 'next/image';

export default function BookSearchPage() {
  const [state, formAction, isPending] = useActionState(searchBooks, {
    docs: [],
    num_found: 0,
    start: 0,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book /> Open Library Search
          </CardTitle>
          <CardDescription>
            Search for books using the Open Library API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex items-end gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="query">Search Query</Label>
              <Input
                id="query"
                name="query"
                placeholder="e.g., The Lord of the Rings"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </form>
           {state?.error && <p className="text-sm text-destructive mt-4">{state.error}</p>}
        </CardContent>
      </Card>

      {isPending && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Searching for books...</p>
        </div>
      )}

      {state.docs && state.docs.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">
            Search Results ({state.num_found} found)
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {state.docs.map((book) => (
              <Card key={book.key} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-4">
                  {book.cover_i && (
                    <Image
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={`Cover of ${book.title}`}
                      width={80}
                      height={120}
                      className="rounded-md object-cover shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    {book.author_name && (
                      <CardDescription>
                        by {book.author_name.join(', ')}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    First published in {book.first_publish_year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {book.edition_count} editions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {!isPending && state.docs && state.docs.length === 0 && state.query && (
         <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 min-h-64">
          <p className="text-muted-foreground">No results found for "{state.query}".</p>
        </div>
      )}
    </div>
  );
}
