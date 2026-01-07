import { Graph, AlgorithmStep } from '../types/graph';

export function* bfs(graph: Graph, startNodeId: string): Generator<AlgorithmStep> {
  const visited = new Set<string>();
  const distances = new Map<string, number>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);
  distances.set(startNodeId, 0);

  graph.nodes.forEach((node) => {
    if (node.id !== startNodeId) {
      distances.set(node.id, Infinity);
    }
  });

  yield {
    type: 'visit',
    nodeId: startNodeId,
    message: `Démarrage BFS depuis le nœud ${startNodeId}`,
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    yield {
      type: 'highlight',
      nodeId: currentId,
      message: `Exploration du nœud ${currentId}`,
      visitedNodes: new Set(visited),
      distances: new Map(distances),
    };

    const neighbors = graph.edges
      .filter((e) => e.from === currentId || (!graph.directed && e.to === currentId))
      .map((e) => (e.from === currentId ? e.to : e.from));

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        distances.set(neighborId, distances.get(currentId)! + 1);

        yield {
          type: 'edge',
          edgeFrom: currentId,
          edgeTo: neighborId,
          message: `Découverte du nœud ${neighborId} depuis ${currentId} (distance: ${distances.get(neighborId)})`,
          visitedNodes: new Set(visited),
          distances: new Map(distances),
        };
      }
    }
  }

  yield {
    type: 'complete',
    message: 'BFS terminé!',
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };
}
