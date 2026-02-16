"use client";

import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  title: string;
  userName?: string | null;
  userEmail?: string | null;
  children?: React.ReactNode;
}

export function Header({ title, userName, userEmail, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileNav userName={userName} userEmail={userEmail} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
