
# Finite Automata Simulator

 Welcome to my project for visualizing and simulating Finite Automata (DFA and NFA). It’s a pretty cool tool I built with Next.js that lets you play around with these computer science concepts in a more visual way.

## What's Inside?

This project is all about making it easier to understand how Finite Automata work. You can:

*   **Define your own DFAs and NFAs:**  You can specify the states, alphabet, transitions, start state, and final states.
*   **Visualize the automaton:**  See a graph of your automaton, which makes it much easier to understand.
*   **Simulate strings:**  You can input a string and see how the automaton processes it, step by step.
*   **Convert NFAs to DFAs:**  There's a feature to automatically convert an NFA to an equivalent DFA.
*   **Check out some examples:** I've included a few example automata to get you started.

## How to Get it Running

So you wanna run it on your own machine? Sweet! Just follow these steps.

First, you'll need to have [Node.js](https://nodejs.org/) installed. I used version 18.18, so anything around that should be fine.

1.  **Install all the packages:**

    This will download all the necessary libraries the project depends on.

    ```bash
    npm install
    ```

2.  **Start the development server:**

    This will get the project up and running on your computer.

    ```bash
    npm run dev
    ```

Now you can open [http://localhost:3000](http://localhost:3000) in your web browser to see the application!

## How to Use It

Once you have the app open, here's what you can do:

1.  **Load an Example:** The easiest way to get started is to pick one of the examples from the dropdown menu. This will fill in the automaton definition for you.
2.  **Define Your Own Automaton:**
    *   Fill out the form with the states, alphabet, transitions, start state, and final states.
    *   Make sure to follow the format instructions for each field!
3.  **Load the Automaton:** Click the "Load Automaton for Simulation" button. You'll see a graph of your automaton appear on the right.
4.  **Simulate a String:**
    *   Type a string into the "Input String" field in the Simulation Panel.
    *   Click "Simulate".
    *   You'll see whether the string is accepted or rejected, and you can use the slider to step through the simulation and see the path in the graph.
5.  **Convert an NFA to a DFA:** If you have an NFA loaded, you can click the "Convert NFA to DFA" button to see the equivalent DFA.

## A Peek at the Code

I've tried to keep the code as organized as possible. Here's a quick rundown of the important files:

*   `src/app/page.tsx`: This is the main page that you see. It's pretty simple and just sets up the layout.
*   `src/components/automaton-workspace.tsx`: This is where most of the magic happens! It manages the state of the application, including the automaton definition, the simulation, and the graph.
*   `src/components/automaton-definition-form.tsx`: This is the form where you define your automaton.
*   `src/components/graph-visualization.tsx`: This component is responsible for drawing the cool-looking graph of the automaton.
*   `src/components/simulation-panel.tsx`: This is where you can input a string to test against your automaton.
*   `src/lib/automata.ts`: This file contains all the logic for parsing automaton definitions, simulating them, and converting NFAs to DFAs.
*   `src/lib/examples.ts`: Here's where I've stored the example automata.

I've added a bunch of comments to the code, especially in `automaton-workspace.tsx` and `page.tsx`, so feel free to dig in and see how it all works!

Hope you have fun playing with it!
