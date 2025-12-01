import type { AutomatonDefinition } from './types';

export const automatonExamples: Array<{ name: string; definition: AutomatonDefinition }> = [
  {
    name: 'DFA: Accepts strings with an even number of 0s',
    definition: {
      type: 'DFA',
      states: 'q0,q1',
      alphabet: '0,1',
      startState: 'q0',
      acceptStates: 'q0',
      transitions: [
        { from: 'q0', input: '0', to: 'q1' },
        { from: 'q0', input: '1', to: 'q0' },
        { from: 'q1', input: '0', to: 'q0' },
        { from: 'q1', input: '1', to: 'q1' },
      ],
    },
  },
  {
    name: 'DFA: Accepts strings ending in "01"',
    definition: {
        type: 'DFA',
        states: 'q0,q1,q2',
        alphabet: '0,1',
        startState: 'q0',
        acceptStates: 'q2',
        transitions: [
            { from: 'q0', input: '0', to: 'q1' },
            { from: 'q0', input: '1', to: 'q0' },
            { from: 'q1', input: '0', to: 'q1' },
            { from: 'q1', input: '1', to: 'q2' },
            { from: 'q2', input: '0', to: 'q1' },
            { from: 'q2', input: '1', to: 'q0' },
        ],
    },
  },
  {
    name: 'NFA: Accepts strings containing "11"',
    definition: {
      type: 'NFA',
      states: 'q0,q1,q2',
      alphabet: '0,1',
      startState: 'q0',
      acceptStates: 'q2',
      transitions: [
        { from: 'q0', input: '0', to: 'q0' },
        { from: 'q0', input: '1', to: 'q0' },
        { from: 'q0', input: '1', to: 'q1' },
        { from: 'q1', input: '1', to: 'q2' },
        { from: 'q2', input: '0', to: 'q2' },
        { from: 'q2', input: '1', to: 'q2' },
      ],
    },
  },
  {
    name: 'NFA: Accepts strings with a 1 in the third-to-last position',
    definition: {
        type: 'NFA',
        states: 'q0,q1,q2,q3',
        alphabet: '0,1',
        startState: 'q0',
        acceptStates: 'q3',
        transitions: [
            { from: 'q0', input: '0', to: 'q0' },
            { from: 'q0', input: '1', to: 'q0' },
            { from: 'q0', input: '1', to: 'q1' },
            { from: 'q1', input: '0', to: 'q2' },
            { from: 'q1', input: '1', to: 'q2' },
            { from: 'q2', input: '0', to: 'q3' },
            { from: 'q2', input: '1', to: 'q3' },
        ],
    },
  },
];
