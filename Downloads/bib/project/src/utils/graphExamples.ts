import { Graph } from '../types/graph';

export const exampleGraphs: Record<string, Graph> = {
  simple: {
    nodes: [
      { id: 'A', x: 200, y: 100, label: 'A' },
      { id: 'B', x: 100, y: 250, label: 'B' },
      { id: 'C', x: 300, y: 250, label: 'C' },
      { id: 'D', x: 200, y: 400, label: 'D' },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'D', weight: 3 },
      { from: 'B', to: 'C', weight: 1 },
    ],
    directed: false,
  },
  weighted: {
    nodes: [
      { id: 'A', x: 150, y: 150, label: 'A' },
      { id: 'B', x: 350, y: 150, label: 'B' },
      { id: 'C', x: 150, y: 350, label: 'C' },
      { id: 'D', x: 350, y: 350, label: 'D' },
      { id: 'E', x: 250, y: 250, label: 'E' },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 7 },
      { from: 'A', to: 'C', weight: 9 },
      { from: 'A', to: 'E', weight: 14 },
      { from: 'B', to: 'E', weight: 10 },
      { from: 'B', to: 'D', weight: 15 },
      { from: 'C', to: 'E', weight: 2 },
      { from: 'C', to: 'D', weight: 11 },
      { from: 'E', to: 'D', weight: 6 },
    ],
    directed: false,
  },
  directed: {
    nodes: [
      { id: 'A', x: 100, y: 200, label: 'A' },
      { id: 'B', x: 250, y: 100, label: 'B' },
      { id: 'C', x: 250, y: 300, label: 'C' },
      { id: 'D', x: 400, y: 100, label: 'D' },
      { id: 'E', x: 400, y: 300, label: 'E' },
      { id: 'F', x: 550, y: 200, label: 'F' },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 1, directed: true },
      { from: 'A', to: 'C', weight: 1, directed: true },
      { from: 'B', to: 'D', weight: 1, directed: true },
      { from: 'C', to: 'E', weight: 1, directed: true },
      { from: 'D', to: 'F', weight: 1, directed: true },
      { from: 'E', to: 'F', weight: 1, directed: true },
      { from: 'B', to: 'C', weight: 1, directed: true },
    ],
    directed: true,
  },
};
