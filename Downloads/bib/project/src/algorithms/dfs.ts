import { Graph, AlgorithmStep } from '../types/graph';

export function* dfs(graph: Graph, startNodeId: string): Generator<AlgorithmStep> {
  const visited = new Set<string>();
  const distances = new Map<string, number>();

  graph.nodes.forEach((node) => {
    distances.set(node.id, Infinity);
  });
  distances.set(startNodeId, 0);

  function* dfsRecursive(nodeId: string, depth: number): Generator<AlgorithmStep> {
    visited.add(nodeId);
    distances.set(nodeId, depth);

    yield {
      type: 'visit',
      nodeId,
      message: `Visite du nœud ${nodeId} (profondeur: ${depth})`,
      visitedNodes: new Set(visited),
      distances: new Map(distances),
    };

    const neighbors = graph.edges
      .filter((e) => e.from === nodeId || (!graph.directed && e.to === nodeId))
      .map((e) => (e.from === nodeId ? e.to : e.from));

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        yield {
          type: 'edge',
          edgeFrom: nodeId,
          edgeTo: neighborId,
          message: `Exploration de l'arête ${nodeId} → ${neighborId}`,
          visitedNodes: new Set(visited),
          distances: new Map(distances),
        };

        yield* dfsRecursive(neighborId, depth + 1);
      }
    }
  }

  yield {
    type: 'highlight',
    nodeId: startNodeId,
    message: `Démarrage DFS depuis le nœud ${startNodeId}`,
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };

  yield* dfsRecursive(startNodeId, 0);

  yield {
    type: 'complete',
    message: 'DFS terminé!',
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };
}
