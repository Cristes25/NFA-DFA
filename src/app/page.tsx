
// This is the main page of the  application.
// It brings together the Header and the AutomatonWorkspace to create the user interface.

import { Header } from '@/components/header';
import { AutomatonWorkspace } from '@/components/automaton-workspace';

export default function Home() {
  return (
    //  flexbox layout to make sure the page fills the whole screen
    // and the main content area can grow to fit the available space.
    <div className="flex min-h-screen w-full flex-col">
      {/* The Header component is displayed at the top of the page. */}
      <Header />
      {/* The main content of the page is the AutomatonWorkspace, where all the magic happens! */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <AutomatonWorkspace />
      </main>
    </div>
  );
}
