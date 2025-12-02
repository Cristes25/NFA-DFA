"use client";

// This is the main component 
// It brings together all the different parts of the automaton simulator.

import React, { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { AutomatonDefinitionForm, automatonSchema } from '@/components/automaton-definition-form';
import { SimulationPanel } from '@/components/simulation-panel';
import { NfaToDfaConverter } from '@/components/nfa-to-dfa-converter';
import type { AnyAutomaton, AutomatonDefinition, SimulationResult } from '@/lib/types';
import { automatonToDefinition, parseAutomatonDefinition, simulateAutomaton } from '@/lib/automata';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { ExampleSelector } from './example-selector';
import { automatonExamples } from '@/lib/examples';


//  "dynamic import" to make our app load faster.
const GraphVisualization = dynamic(() => import('@/components/graph-visualization').then(mod => mod.GraphVisualization), {
  ssr: false, // This component will only be rendered on the client-side
  loading: () => <p>Loading graph...</p> // Show a loading message while the component is being loaded.
});

// e default values to show when the app first loads.
// the first example from our list of automaton examples.
const defaultValues = automatonExamples[0].definition;

export function AutomatonWorkspace() {
  const { toast } = useToast(); // A handy hook for showing success or error messages.

  //hook to keep track of the important data in our app.
  const [activeAutomaton, setActiveAutomaton] = useState<AnyAutomaton | null>(null); // The currently loaded automaton (DFA or NFA).
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null); // The result of the simulation (whether the input string was accepted or rejected).
  const [simulationTrace, setSimulationTrace] = useState<string[]>([]); // A step-by-step log of the simulation.
  const [currentStep, setCurrentStep] = useState(0); // The current step of the simulation being displayed.

  //  "react-hook-form" library to manage the form for defining the automaton.
  const form = useForm<z.infer<typeof automatonSchema>>({
    resolver: zodResolver(automatonSchema), //  "zod" to define the shape of our form data and validate it.
    defaultValues,
    mode: 'onChange', // The form will be validated whenever the user makes a change.
  });

  const formValues = form.watch(); // watching for changes in the form values.

  //  "useMemo" to parse the automaton definition only when the form values change.
  // This helps to avoid unnecessary re-calculations and makes  app more efficient.
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

  // This function is called when the user submits the automaton definition form.
  const onSubmit = (data: z.infer<typeof automatonSchema>) => {
    try {
      const parsed = parseAutomatonDefinition(data);
      setActiveAutomaton(parsed); //  set the parsed automaton as the active one.
      setSimulationResult(null); // reset the simulation result.
      setSimulationTrace([]); //  clear the simulation trace.
      setCurrentStep(0); //  reset the current step.
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

  // This function is called when the user clicks the "Simulate" button.
  const handleSimulate = (inputString: string) => {
    if (!activeAutomaton) return; // can't simulate if there's no active automaton.
    const result = simulateAutomaton(activeAutomaton, inputString);
    setSimulationResult(result);
    setSimulationTrace(result.trace);
    setCurrentStep(0);
  };

  // This function allows the user to load one of the predefined automaton examples.
  const loadAutomaton = (automaton: AnyAutomaton | AutomatonDefinition) => {
    const definition = 'type' in automaton && 'states' in automaton && typeof automaton.states === 'string'
      ? automaton
      : automatonToDefinition(automaton as AnyAutomaton);
    
    form.reset(definition);
    //  "setTimeout" to make sure the form is updated correctly.
    setTimeout(() => {         
    }, 0);        
  };
  
  //  to figure out which state is currently active in the simulation.
  const activeState = useMemo(() => {
    if (simulationTrace.length > 0 && currentStep < simulationTrace.length) {
      const match = simulationTrace[currentStep].match(/Current state: (\w+)/);
      return match ? match[1] : null;
    }
    return null;
  }, [simulationTrace, currentStep]);

  //  layout of component.
  // grid layout to arrange the different parts of the UI.
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="flex flex-col gap-6">
        {/* The ExampleSelector component allows the user to choose one of the predefined examples. */}
        <ExampleSelector onSelect={loadAutomaton} />
        {/* The AutomatonDefinitionForm is where the user can define their own automaton. */}
        <AutomatonDefinitionForm form={form} onSubmit={onSubmit} />
        {/* This button allows the user to load the automaton for simulation. */}
        <Button onClick={form.handleSubmit(onSubmit)} size="lg" className="w-full">
          Load Automaton for Simulation
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        {/* The GraphVisualization component displays a visual representation of the automaton. */}
        <GraphVisualization automaton={parsedAutomaton} activeState={activeState} />
        {/* The SimulationPanel component provides controls for running the simulation and displays the results. */}
        <SimulationPanel
          automaton={activeAutomaton}
          result={simulationResult}
          trace={simulationTrace}
          currentStep={currentStep}
          onSimulate={handleSimulate}
          onStepChange={setCurrentStep}
        />
        {/* The NfaToDfaConverter component allows the user to convert an NFA to a DFA. */}
        <NfaToDfaConverter nfa={parsedAutomaton?.type === 'NFA' ? parsedAutomaton : null} loadAutomaton={loadAutomaton} />
      </div>
    </div>
  );
}
