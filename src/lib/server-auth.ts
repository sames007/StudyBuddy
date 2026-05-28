import { firebaseConfig } from '@/lib/firebase-config';
import { z } from 'zod';

const idTokenSchema = z.string().trim().min(100).max(5000);

const lookupResponseSchema = z.object({
  users: z
    .array(
      z.object({
        localId: z.string().min(1),
      })
    )
    .min(1),
});

type AuthenticatedUser = {
  uid: string;
};

export async function requireAuthenticatedUser(formData: FormData): Promise<AuthenticatedUser> {
  const parsedToken = idTokenSchema.safeParse(formData.get('idToken'));

  if (!parsedToken.success) {
    throw new Error('You must be signed in to use AI features.');
  }

  // Verify the token before protected actions spend Gemini quota or proxy requests.
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: parsedToken.data }),
    }
  );

  if (!response.ok) {
    throw new Error('Your sign-in session expired. Please sign in again.');
  }

  const payload = lookupResponseSchema.safeParse(await response.json());
  if (!payload.success) {
    throw new Error('Unable to verify your sign-in session. Please sign in again.');
  }

  return { uid: payload.data.users[0].localId };
}
