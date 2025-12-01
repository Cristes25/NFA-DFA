import { Terminal } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-card/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
          <Terminal className="h-6 w-6" />
        </div>
        <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground">
          Automata Ace
        </h1>
      </div>
    </header>
  );
}
