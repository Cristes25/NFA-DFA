import {
  type AnyAutomaton,
  type AutomatonDefinition,
  type DFA,
  type NFA,
  type SimulationResult,
  State,
  AlphabetSymbol,
  EPSILON,
} from '@/lib/types';

export function parseAutomatonDefinition(
  definition: AutomatonDefinition
): AnyAutomaton {
  const states = definition.states.split(',').map((s) => s.trim()).filter(Boolean);
  const alphabet = definition.alphabet.split(',').map((s) => s.trim()).filter(Boolean);
  const startState = definition.startState.trim();
  const acceptStates = definition.acceptStates.split(',').map((s) => s.trim()).filter(Boolean);

  if (states.length === 0) throw new Error('At least one state is required.');
  if (alphabet.length === 0) throw new Error('At least one alphabet symbol is required.');
  if (!startState) throw new Error('Start state is required.');
  if (!states.includes(startState)) throw new Error('Start state must be in the set of states.');
  if (acceptStates.some(s => !states.includes(s))) throw new Error('All accept states must be in the set of states.');

  const transitions = definition.transitions.map((t, i) => {
    if (!t.from || !t.to) throw new Error(`Transition #${i + 1} is incomplete.`);
    if (definition.type === 'DFA' && t.input === EPSILON) throw new Error(`DFA cannot have epsilon (ε) transitions.`);
    return { ...t };
  });

  const baseAutomaton = { states, alphabet, startState, acceptStates };

  if (definition.type === 'DFA') {
    // Validate DFA has one transition per state-symbol pair
    const transitionMap = new Map<string, string>();
    for(const t of transitions) {
        const key = `${t.from},${t.input}`;
        if(transitionMap.has(key)) throw new Error(`DFA Error: Multiple transitions defined for state '${t.from}' with input '${t.input}'.`);
        transitionMap.set(key, t.to);
    }
    return { ...baseAutomaton, type: 'DFA', transitions } as DFA;
  }

  return { ...baseAutomaton, type: 'NFA', transitions } as NFA;
}

export function simulateAutomaton(automaton: AnyAutomaton, input: string): SimulationResult {
  if (automaton.type === 'DFA') return simulateDFA(automaton, input);
  return simulateNFA(automaton, input);
}

function simulateDFA(dfa: DFA, input: string): SimulationResult {
  let currentState = dfa.startState;
  const trace: string[] = [`Start at state: ${currentState}`];

  for (const symbol of input) {
    if (!dfa.alphabet.includes(symbol)) {
      trace.push(`Input symbol '${symbol}' not in alphabet. Rejecting.`);
      return { accepted: false, trace };
    }
    const transition = dfa.transitions.find(t => t.from === currentState && t.input === symbol);
    if (!transition) {
      trace.push(`No transition from state '${currentState}' with input '${symbol}'. Rejecting.`);
      return { accepted: false, trace };
    }
    currentState = transition.to;
    trace.push(`Read '${symbol}', move to state: ${currentState}`);
  }

  const accepted = dfa.acceptStates.includes(currentState);
  trace.push(accepted ? `End of input. State '${currentState}' is an accept state. Accepting.` : `End of input. State '${currentState}' is not an accept state. Rejecting.`);
  return { accepted, trace };
}

function simulateNFA(nfa: NFA, input: string): SimulationResult {
  let currentStates = epsilonClosure(new Set([nfa.startState]), nfa);
  const trace: string[] = [`Start at states: {${[...currentStates].join(', ')}}`];

  for (const symbol of input) {
    if (symbol !== EPSILON && !nfa.alphabet.includes(symbol)) {
      trace.push(`Input symbol '${symbol}' not in alphabet. Rejecting.`);
      return { accepted: false, trace };
    }

    let nextStates = new Set<State>();
    for (const state of currentStates) {
      nfa.transitions
        .filter(t => t.from === state && t.input === symbol)
        .forEach(t => nextStates.add(t.to));
    }

    currentStates = epsilonClosure(nextStates, nfa);
    trace.push(`Read '${symbol}', active states: {${[...currentStates].join(', ')}}`);

    if (currentStates.size === 0) {
      trace.push(`No further transitions. Rejecting.`);
      return { accepted: false, trace };
    }
  }

  const accepted = [...currentStates].some(s => nfa.acceptStates.includes(s));
  trace.push(accepted ? `End of input. At least one active state is an accept state. Accepting.` : `End of input. No active state is an accept state. Rejecting.`);
  return { accepted, trace };
}

function epsilonClosure(states: Set<State>, nfa: NFA): Set<State> {
  const closure = new Set(states);
  const queue = [...states];
  while (queue.length > 0) {
    const currentState = queue.shift()!;
    nfa.transitions
      .filter(t => t.from === currentState && t.input === EPSILON)
      .forEach(t => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          queue.push(t.to);
        }
      });
  }
  return closure;
}

export function convertNFAtoDFA(nfa: NFA): DFA {
  const dfaStatesMap = new Map<string, Set<State>>();
  const dfaTransitions: DFA['transitions'] = [];
  const dfaAcceptStates: State[] = [];
  
  const startClosure = epsilonClosure(new Set([nfa.startState]), nfa);
  const dfaStartStateName = subsetToStateName(startClosure);
  dfaStatesMap.set(dfaStartStateName, startClosure);

  const worklist: string[] = [dfaStartStateName];
  const processedStates = new Set<string>();

  while(worklist.length > 0) {
    const currentDfaStateName = worklist.shift()!;
    if (processedStates.has(currentDfaStateName)) continue;
    processedStates.add(currentDfaStateName);
    
    const currentNfaStates = dfaStatesMap.get(currentDfaStateName)!;

    if ([...currentNfaStates].some(s => nfa.acceptStates.includes(s))) {
      dfaAcceptStates.push(currentDfaStateName);
    }
    
    for (const symbol of nfa.alphabet) {
      let nextNfaStates = new Set<State>();
      for (const nfaState of currentNfaStates) {
        nfa.transitions
          .filter(t => t.from === nfaState && t.input === symbol)
          .forEach(t => nextNfaStates.add(t.to));
      }
      
      const nextNfaStatesWithEpsilon = epsilonClosure(nextNfaStates, nfa);

      if (nextNfaStatesWithEpsilon.size > 0) {
        const nextDfaStateName = subsetToStateName(nextNfaStatesWithEpsilon);
        
        if (!dfaStatesMap.has(nextDfaStateName)) {
          dfaStatesMap.set(nextDfaStateName, nextNfaStatesWithEpsilon);
          worklist.push(nextDfaStateName);
        }
        
        dfaTransitions.push({ from: currentDfaStateName, input: symbol, to: nextDfaStateName });
      }
    }
  }

  const dfaStates = Array.from(dfaStatesMap.keys());
  
  return {
    type: 'DFA',
    states: dfaStates,
    alphabet: nfa.alphabet,
    startState: dfaStartStateName,
    acceptStates: dfaAcceptStates,
    transitions: dfaTransitions,
  };
}

function subsetToStateName(subset: Set<State>): string {
    return `{${[...subset].sort().join(',')}}`;
}

export function automatonToDefinition(automaton: AnyAutomaton): AutomatonDefinition {
    return {
        type: automaton.type,
        states: automaton.states.join(','),
        alphabet: automaton.alphabet.join(','),
        startState: automaton.startState,
        acceptStates: automaton.acceptStates.join(','),
        transitions: automaton.transitions.map(t => ({...t}))
    }
}
