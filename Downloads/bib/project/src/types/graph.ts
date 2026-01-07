export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
  directed?: boolean;
  capacity?: number;
  flow?: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  directed: boolean;
}

export interface AlgorithmStep {
  type: 'visit' | 'edge' | 'highlight' | 'complete' | 'path';
  nodeId?: string;
  edgeFrom?: string;
  edgeTo?: string;
  message: string;
  visitedNodes?: Set<string>;
  currentPath?: string[];
  distances?: Map<string, number>;
  flowData?: Map<string, Map<string, number>>;
}

export type AlgorithmType =
  | 'bfs'
  | 'dfs'
  | 'dijkstra'
  | 'prim'
  | 'kruskal'
  | 'topological'
  | 'fordFulkerson'
  | 'graphColoring'
  | 'hungarian';
