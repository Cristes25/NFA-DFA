"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { NFA, DFA, AnyAutomaton, AutomatonDefinition } from '@/lib/types';
import { convertNFAtoDFA } from '@/lib/automata';
import { DfaDisplay } from './dfa-display';
import { RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Bot } from 'lucide-react';

type NfaToDfaConverterProps = {
  nfa: NFA | null;
  loadAutomaton: (automaton: AnyAutomaton | AutomatonDefinition) => void;
};

export function NfaToDfaConverter({ nfa, loadAutomaton }: NfaToDfaConverterProps) {
  const [convertedDfa, setConvertedDfa] = useState<DFA | null>(null);
  const { toast } = useToast();

  const handleConvert = () => {
    if (!nfa) return;
    try {
      const dfa = convertNFAtoDFA(nfa);
      setConvertedDfa(dfa);
      toast({
        title: 'Conversion Successful',
        description: 'NFA has been converted to an equivalent DFA.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
        description: e.message || 'An unknown error occurred during conversion.',
      });
    }
  };

  const handleLoadDfa = () => {
    if (!convertedDfa) return;
    loadAutomaton(convertedDfa);
     toast({
        title: 'DFA Loaded',
        description: 'The converted DFA is now active for simulation.',
      });
  }

  const isNfaLoaded = nfa?.type === 'NFA';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">NFA to DFA Converter</CardTitle>
        <CardDescription>Convert your NFA to an equivalent DFA using subset construction.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleConvert} disabled={!isNfaLoaded} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Convert to DFA
        </Button>

        {!isNfaLoaded && (
            <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>NFA Not Loaded</AlertTitle>
                <AlertDescription>
                    Load or define an NFA to use the converter.
                </AlertDescription>
            </Alert>
        )}

        {convertedDfa && (
          <div className="space-y-4">
            <DfaDisplay dfa={convertedDfa} />
            <Button onClick={handleLoadDfa} variant="secondary" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Load Converted DFA for Testing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
