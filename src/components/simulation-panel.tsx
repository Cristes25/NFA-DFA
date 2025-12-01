"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { AnyAutomaton, SimulationResult } from '@/lib/types';
import { simulateAutomaton } from '@/lib/automata';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle2, XCircle, Play, FileText, Bot } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type SimulationPanelProps = {
  automaton: AnyAutomaton | null;
};

export function SimulationPanel({ automaton }: SimulationPanelProps) {
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = () => {
    if (!automaton) return;
    const simulationResult = simulateAutomaton(automaton, inputString);
    setResult(simulationResult);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Simulation Engine</CardTitle>
        <CardDescription>Test your automaton with an input string.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter string to test..."
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            disabled={!automaton}
            className="font-code"
          />
          <Button onClick={handleSimulate} disabled={!automaton}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>

        {!automaton && (
          <Alert>
             <Bot className="h-4 w-4" />
            <AlertTitle>No Automaton Loaded</AlertTitle>
            <AlertDescription>
              Please define an automaton and click "Load Automaton for Simulation" to begin testing.
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <Alert variant={result.accepted ? 'default' : 'destructive'} className="bg-opacity-20">
              {result.accepted ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>Simulation Result: {result.accepted ? 'Accepted' : 'Rejected'}</AlertTitle>
              <AlertDescription>
                The input string "{inputString}" was {result.accepted ? 'accepted' : 'rejected'} by the {automaton?.type}.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
                <h4 className="flex items-center text-sm font-medium">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    Transition Trace
                </h4>
                <ScrollArea className="h-48 w-full rounded-md border p-4 font-code text-sm">
                {result.trace.map((step, index) => (
                    <p key={index}>{step}</p>
                ))}
                </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
