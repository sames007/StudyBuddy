'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { storage } from '@/lib/firebase';
import {
  getAvatarExtension,
  isAllowedAvatarType,
  MAX_AVATAR_SIZE_BYTES,
} from '@/lib/limits';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
});

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
    },
  });

  useEffect(() => {
    setPhotoURL(user?.photoURL ?? null);
  }, [user?.photoURL]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!isAllowedAvatarType(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File',
        description: 'Please upload a PNG, JPG, GIF, or WebP image.',
      });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Please choose an image smaller than 2 MB.',
      });
      return;
    }

    setIsUploading(true);
    const extension = getAvatarExtension(file.type);
    const storageRef = ref(storage, `avatars/${user.uid}/${crypto.randomUUID()}.${extension}`);

    try {
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { owner: user.uid },
      });
      const nextPhotoURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL: nextPhotoURL });
      setPhotoURL(nextPhotoURL);
      toast({ title: 'Success', description: 'Profile picture updated!' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unable to upload your profile picture.',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;

    if (values.displayName !== user.displayName) {
      try {
        await updateProfile(user, { displayName: values.displayName });
        toast({ title: 'Success', description: 'Profile updated successfully!' });
      } catch (error: unknown) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error instanceof Error ? error.message : 'Unable to update your profile.',
        });
      }
    } else {
        toast({ title: 'No Changes', description: 'You have not made any changes to your profile.' });
    }
  }
  
  if (loading || !user) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                  <Skeleton className="h-10 w-32" />
              </div>
          </CardContent>
        </Card>
      )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Manage your account settings and profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait"
              aria-label="Change profile picture"
            >
              <Avatar className="h-24 w-24 border-2 border-background shadow-md ring-1 ring-border">
                <AvatarImage src={photoURL ?? ''} alt={user?.displayName ?? 'Profile picture'} />
                <AvatarFallback className="bg-primary/10 text-3xl font-semibold text-primary">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </span>
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{user.displayName || 'StudyBuddy user'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button variant="outline" onClick={handleAvatarClick} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Change Picture'}
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="hidden"
          />
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="displayName">Full Name</Label>
            <Input id="displayName" {...form.register('displayName')} />
            {form.formState.errors.displayName && (
              <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
            )}
           </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...form.register('email')} disabled />
            <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
           </div>
           <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
           </Button>
        </form>

      </CardContent>
    </Card>
  );
}
