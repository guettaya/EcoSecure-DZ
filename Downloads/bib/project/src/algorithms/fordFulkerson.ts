import { Graph, AlgorithmStep } from '../types/graph';

export function* fordFulkerson(
  graph: Graph,
  sourceId: string,
  sinkId: string
): Generator<AlgorithmStep> {
  if (!graph.directed) {
    yield {
      type: 'complete',
      message: 'Ford-Fulkerson nécessite un graphe orienté!',
      visitedNodes: new Set(),
    };
    return;
  }

  const n = graph.nodes.length;
  const capacity: Map<string, Map<string, number>> = new Map();
  const flow: Map<string, Map<string, number>> = new Map();

  graph.nodes.forEach((node) => {
    capacity.set(node.id, new Map());
    flow.set(node.id, new Map());
  });

  graph.edges.forEach((edge) => {
    const cap = edge.capacity || edge.weight;
    const fromMap = capacity.get(edge.from)!;
    fromMap.set(edge.to, (fromMap.get(edge.to) || 0) + cap);
  });

  yield {
    type: 'highlight',
    message: `Initialisation: Source = ${sourceId}, Puits = ${sinkId}`,
    visitedNodes: new Set([sourceId, sinkId]),
    flowData: flow,
  };

  let maxFlow = 0;
  let iteration = 0;

  while (true) {
    iteration++;
    const visited = new Set<string>();
    const parent: Map<string, string> = new Map();

    const queue: string[] = [sourceId];
    visited.add(sourceId);

    yield {
      type: 'visit',
      nodeId: sourceId,
      message: `Itération ${iteration}: Recherche d'un chemin augmentant depuis ${sourceId}`,
      visitedNodes: new Set(visited),
      flowData: flow,
    };

    let foundPath = false;

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === sinkId) {
        foundPath = true;
        break;
      }

      const neighbors = graph.edges
        .filter((e) => e.from === current)
        .map((e) => e.to);

      for (const neighbor of neighbors) {
        const residual =
          (capacity.get(current)?.get(neighbor) || 0) -
          (flow.get(current)?.get(neighbor) || 0);

        if (!visited.has(neighbor) && residual > 0) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);

          yield {
            type: 'edge',
            edgeFrom: current,
            edgeTo: neighbor,
            message: `Exploration: ${current} → ${neighbor} (capacité résiduelle: ${residual})`,
            visitedNodes: new Set(visited),
            flowData: flow,
          };
        }
      }
    }

    if (!foundPath) {
      yield {
        type: 'complete',
        message: `Flot maximal trouvé: ${maxFlow}`,
        visitedNodes: visited,
        flowData: flow,
      };
      break;
    }

    const path: string[] = [];
    let current = sinkId;
    while (current !== sourceId) {
      path.unshift(current);
      current = parent.get(current)!;
    }
    path.unshift(sourceId);

    let minResidual = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const residual =
        (capacity.get(from)?.get(to) || 0) - (flow.get(from)?.get(to) || 0);
      minResidual = Math.min(minResidual, residual);
    }

    yield {
      type: 'path',
      message: `Chemin trouvé: ${path.join(' → ')} (flot ajouté: ${minResidual})`,
      currentPath: path,
      visitedNodes: new Set(path),
      flowData: flow,
    };

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const flowMap = flow.get(from)!;
      flowMap.set(to, (flowMap.get(to) || 0) + minResidual);
    }

    maxFlow += minResidual;

    yield {
      type: 'highlight',
      message: `Flot actuel: ${maxFlow}`,
      visitedNodes: new Set(path),
      flowData: flow,
    };
  }
}
