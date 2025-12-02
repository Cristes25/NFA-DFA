"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { AnyAutomaton } from '@/lib/types';

// --- TYPE DEFINITIONS ---
interface GraphNode {
  id: string;
  x: number;
  y: number;
  isStartState?: boolean;
  isAcceptState?: boolean;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  label: string;
  isSelfLoop: boolean;
  isReversed: boolean;
}

type GraphVisualizationProps = {
  automaton: AnyAutomaton | null;
  activeState?: string | null;
};

// --- CONSTANTS ---
const NODE_RADIUS = 20;
const PADDING = 60; // Padding around the layout

// --- LAYOUT LOGIC ---
const getLayout = (automaton: AnyAutomaton, width: number, height: number): { nodes: GraphNode[], links: GraphLink[] } => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap: { [key: string]: GraphNode } = {};

  const numStates = automaton.states.length;
  const layoutWidth = Math.max(0, width - PADDING * 2);
  const spacing = numStates > 1 ? layoutWidth / (numStates - 1) : 0;

  // 1. Position nodes in a simple line
  automaton.states.forEach((stateId, index) => {
    const xPos = numStates > 1 ? PADDING + index * spacing : width / 2;
    const node: GraphNode = {
      id: stateId,
      x: xPos,
      y: height / 2,
      isStartState: stateId === automaton.startState,
      isAcceptState: automaton.acceptStates.includes(stateId),
    };
    nodes.push(node);
    nodeMap[stateId] = node;
  });

  // 2. Group transitions and create links
  const linkGroups: { [key: string]: { source: GraphNode; target: GraphNode; inputs: string[] } } = {};

  automaton.transitions.forEach(({ from, to, input }) => {
    const source = nodeMap[from];
    const target = nodeMap[to];

    if (source && target) {
      const key = `${from}-${to}`;
      if (!linkGroups[key]) {
        linkGroups[key] = {
          source,
          target,
          inputs: [],
        };
      }
      linkGroups[key].inputs.push(input || 'ε');
    }
  });

  const finalLinks: GraphLink[] = Object.values(linkGroups).map(group => {
    const { source, target, inputs } = group;
    const isReversed = !!linkGroups[`${target.id}-${source.id}`];

    return {
      source,
      target,
      label: inputs.join(', '),
      isSelfLoop: source.id === target.id,
      isReversed,
    };
  });

  return { nodes, links: finalLinks };
};

// --- REACT COMPONENT ---
export function GraphVisualization({ automaton, activeState }: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 320 }); // Default height

  // Observe container size
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries && entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        setDims({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Render placeholder if no automaton is loaded
  if (!automaton) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-md border border-dashed bg-secondary/20">
        <p className="text-muted-foreground">Load an automaton to see the visualization</p>
      </div>
    );
  }

  // Get layout based on current dimensions
  const { nodes, links } = dims.width > 0 ? getLayout(automaton, dims.width, dims.height) : { nodes: [], links: [] };

  return (
    <div ref={containerRef} className="rounded-md border bg-white flex justify-center items-center w-full h-80">
      {dims.width > 0 && (
        <svg width={dims.width} height={dims.height} style={{ fontFamily: 'sans-serif' }}>
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
            </marker>
          </defs>

          {/* Render Links */}
          {links.map((link, i) => {
            const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
            const sourceX = link.source.x + NODE_RADIUS * Math.cos(angle);
            const sourceY = link.source.y + NODE_RADIUS * Math.sin(angle);
            const targetX = link.target.x - NODE_RADIUS * Math.cos(angle);
            const targetY = link.target.y - NODE_RADIUS * Math.sin(angle);

            if (link.isSelfLoop) {
              const { x, y } = link.source;
              return (
                <g key={i}>
                  <path d={`M ${x} ${y - NODE_RADIUS} A ${NODE_RADIUS} ${NODE_RADIUS} 0 1 1 ${x + 1} ${y - NODE_RADIUS}`} stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />
                  <text x={x} y={y - NODE_RADIUS * 2.2} textAnchor="middle" fontSize="12">{link.label}</text>
                </g>
              );
            }

            if (link.isReversed && link.source.id < link.target.id) {
                const dx = targetX - sourceX, dy = targetY - sourceY;
                const dr = Math.sqrt(dx * dx + dy * dy) * 2; // Arc radius
                return (
                    <g key={i}>
                        <path d={`M${sourceX},${sourceY} A${dr},${dr} 0 0,1 ${targetX},${targetY}`} stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)"/>
                        <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2 + 15} textAnchor="middle" fontSize="12">{link.label}</text>
                    </g>
                )
            }
            
            if (!link.isReversed) {
                return (
                    <g key={i}>
                        <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke="#333" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
                        <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2 - 8} textAnchor="middle" fontSize="12">{link.label}</text>
                    </g>
                );
            }
            return null;
          })}

          {/* Render Nodes */}
          {nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle r={NODE_RADIUS} fill="white" stroke={activeState === node.id ? '#facc15' : '#333'} strokeWidth={activeState === node.id ? 2.5 : 1.5} />
              {node.isAcceptState && <circle r={NODE_RADIUS * 0.75} stroke="#333" strokeWidth="1.5" fill="none" />}
              <text textAnchor="middle" dy=".3em" fill="black" fontSize="14">{node.id}</text>
              {node.isStartState && <path d={`M ${-NODE_RADIUS - 20} 0 L ${-NODE_RADIUS - 5} 0`} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)"/>}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
