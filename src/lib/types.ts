export type State = string;
export type AlphabetSymbol = string;
export const EPSILON = 'ε';

export interface Transition {
  from: State;
  input: AlphabetSymbol;
  to: State;
}

export interface NFATransition {
  from: State;
  input: AlphabetSymbol | typeof EPSILON;
  to: State;
}

interface Automaton {
  states: State[];
  alphabet: AlphabetSymbol[];
  startState: State;
  acceptStates: State[];
}

export interface DFA extends Automaton {
  type: 'DFA';
  transitions: Transition[];
}

export interface NFA extends Automaton {
  type: 'NFA';
  transitions: NFATransition[];
}

export type AnyAutomaton = DFA | NFA;

export type AutomatonDefinition = {
  type: 'DFA' | 'NFA';
  states: string;
  alphabet: string;
  startState: string;
  acceptStates: string;
  transitions: Array<{ from: string; input: string; to: string }>;
};

export interface SimulationResult {
  accepted: boolean;
  trace: string[];
}
