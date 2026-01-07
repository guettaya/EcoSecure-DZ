import { Graph, AlgorithmStep } from '../types/graph';

export function* dijkstra(
  graph: Graph,
  startNodeId: string
): Generator<AlgorithmStep> {
  const distances = new Map<string, number>();
  const visited = new Set<string>();
  const previous = new Map<string, string | null>();

  graph.nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });
  distances.set(startNodeId, 0);

  yield {
    type: 'visit',
    nodeId: startNodeId,
    message: `Initialisation: Distance de ${startNodeId} = 0`,
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };

  while (visited.size < graph.nodes.length) {
    let minDistance = Infinity;
    let currentId: string | null = null;

    for (const node of graph.nodes) {
      if (!visited.has(node.id) && distances.get(node.id)! < minDistance) {
        minDistance = distances.get(node.id)!;
        currentId = node.id;
      }
    }

    if (currentId === null || minDistance === Infinity) break;

    visited.add(currentId);

    yield {
      type: 'highlight',
      nodeId: currentId,
      message: `Traitement du nœud ${currentId} (distance: ${minDistance})`,
      visitedNodes: new Set(visited),
      distances: new Map(distances),
    };

    const edges = graph.edges.filter(
      (e) => e.from === currentId || (!graph.directed && e.to === currentId)
    );

    for (const edge of edges) {
      const neighborId = edge.from === currentId ? edge.to : edge.from;
      if (visited.has(neighborId)) continue;

      const newDistance = distances.get(currentId)! + edge.weight;

      if (newDistance < distances.get(neighborId)!) {
        distances.set(neighborId, newDistance);
        previous.set(neighborId, currentId);

        yield {
          type: 'edge',
          edgeFrom: currentId,
          edgeTo: neighborId,
          message: `Mise à jour: Distance de ${neighborId} = ${newDistance}`,
          visitedNodes: new Set(visited),
          distances: new Map(distances),
        };
      }
    }
  }

  yield {
    type: 'complete',
    message: 'Algorithme de Dijkstra terminé!',
    visitedNodes: new Set(visited),
    distances: new Map(distances),
  };
}
