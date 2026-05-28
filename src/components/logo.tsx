import { GraduationCap } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-7 w-7 text-primary" />
      <span className="text-xl font-semibold tracking-tight">{APP_NAME}</span>
    </div>
  );
}
