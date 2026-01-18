'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { z } from 'zod';
// import { getAuthenticatedUser } from '@/lib/get-auth';


type State = {
  error?: string;
  success?: boolean;
};

export async function deleteHistoryItem(itemId: string): Promise<State> {
  // Not checking for user as this will be checked via security rules
  
  const schema = z.string().min(1, 'Item ID cannot be empty.');
  const validatedId = schema.safeParse(itemId);

  if (!validatedId.success) {
    return { error: 'Invalid item ID.' };
  }
  const docRef = doc(db, 'studies', validatedId.data);

  try {
    // Note: Security rules in Firestore should prevent unauthorized deletion.
    // The rule should check if the document's userId matches the authenticated user's UID.
    await deleteDoc(docRef);
    return { success: true };
  } catch (e: any) {
    console.error('Firestore delete error:', e);
    if (e.code === 'permission-denied') {
        return { error: 'You do not have permission to delete this item.' };
    }
    return { error: 'Failed to delete history item. Please try again.' };
  }
}
