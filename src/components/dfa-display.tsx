import type { DFA } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ArrowRight } from 'lucide-react';

type DfaDisplayProps = {
  dfa: DFA;
};

const DisplayField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center">
    <p className="w-28 shrink-0 text-sm font-medium text-muted-foreground">{label}</p>
    <p className="font-code rounded-md bg-muted px-2 py-1 text-sm">{value}</p>
  </div>
);

export function DfaDisplay({ dfa }: DfaDisplayProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Converted DFA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DisplayField label="States (Q)" value={dfa.states.join(', ')} />
        <DisplayField label="Alphabet (Σ)" value={dfa.alphabet.join(', ')} />
        <DisplayField label="Start State (q₀)" value={dfa.startState} />
        <DisplayField label="Accept States (F)" value={dfa.acceptStates.join(', ')} />
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">Transitions (δ)</p>
          <ScrollArea className="h-40 w-full rounded-md border bg-background p-2">
            <div className="font-code text-sm">
              {dfa.transitions.map((t, i) => (
                <p key={i} className="flex items-center gap-2">
                  <span>δ({t.from}, {t.input})</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{t.to}</span>
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
