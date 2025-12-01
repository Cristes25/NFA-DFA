"use client";

import React, { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AutomatonDefinitionForm, automatonSchema } from '@/components/automaton-definition-form';
import { SimulationPanel } from '@/components/simulation-panel';
import { NfaToDfaConverter } from '@/components/nfa-to-dfa-converter';
import type { AnyAutomaton, AutomatonDefinition } from '@/lib/types';
import { automatonToDefinition, parseAutomatonDefinition } from '@/lib/automata';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { ExampleSelector } from './example-selector';
import { automatonExamples } from '@/lib/examples';

const defaultValues = automatonExamples[0].definition;

export function AutomatonWorkspace() {
  const { toast } = useToast();
  const [activeAutomaton, setActiveAutomaton] = useState<AnyAutomaton | null>(null);

  const form = useForm<z.infer<typeof automatonSchema>>({
    resolver: zodResolver(automatonSchema),
    defaultValues,
    mode: 'onChange',
  });

  const formValues = form.watch();

  const parsedAutomaton = useMemo(() => {
    try {
      const result = automatonSchema.safeParse(formValues);
      if (result.success) {
        const parsed = parseAutomatonDefinition(result.data);
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [formValues]);

  const onSubmit = (data: z.infer<typeof automatonSchema>) => {
    try {
      const parsed = parseAutomatonDefinition(data);
      setActiveAutomaton(parsed);
      toast({
        title: 'Automaton Loaded',
        description: `${parsed.type} has been successfully loaded for simulation.`,
      });
    } catch (error: any) {
      setActiveAutomaton(null);
      toast({
        variant: 'destructive',
        title: 'Error Parsing Automaton',
        description: error.message,
      });
    }
  };

  const loadAutomaton = (automaton: AnyAutomaton | AutomatonDefinition) => {
    const definition = 'type' in automaton && 'states' in automaton && typeof automaton.states === 'string'
      ? automaton
      : automatonToDefinition(automaton as AnyAutomaton);
    
    form.reset(definition);
    // Trigger re-validation and update
    setTimeout(() => {
        onSubmit(definition);
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="flex flex-col gap-6">
        <ExampleSelector onSelect={loadAutomaton} />
        <AutomatonDefinitionForm form={form} onSubmit={onSubmit} />
        <Button onClick={form.handleSubmit(onSubmit)} size="lg" className="w-full">
          Load Automaton for Simulation
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <SimulationPanel automaton={activeAutomaton} />
        <NfaToDfaConverter nfa={parsedAutomaton?.type === 'NFA' ? parsedAutomaton : null} loadAutomaton={loadAutomaton} />
      </div>
    </div>
  );
}
