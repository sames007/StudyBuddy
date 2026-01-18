'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { navLinks } from '@/lib/nav-links';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Logo } from '../logo';
import { ThemeToggle } from '../theme-toggle';

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <Link href="/dashboard" className="flex items-center gap-2 border-b p-4 text-lg font-semibold">
            <Logo />
          </Link>
          <nav className="grid gap-2 p-4 text-base font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center justify-end gap-2 md:ml-auto">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
