import { Graph, AlgorithmStep } from '../types/graph';

export function* topologicalSort(graph: Graph): Generator<AlgorithmStep> {
  if (!graph.directed) {
    yield {
      type: 'complete',
      message: 'Le tri topologique nécessite un graphe orienté!',
      visitedNodes: new Set(),
    };
    return;
  }

  const inDegree = new Map<string, number>();
  const result: string[] = [];
  const queue: string[] = [];

  graph.nodes.forEach((node) => inDegree.set(node.id, 0));

  graph.edges.forEach((edge) => {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  });

  yield {
    type: 'highlight',
    message: 'Calcul des degrés entrants de chaque nœud',
    visitedNodes: new Set(),
  };

  graph.nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  yield {
    type: 'visit',
    message: `Nœuds sans prédécesseurs: ${queue.join(', ')}`,
    visitedNodes: new Set(queue),
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    yield {
      type: 'highlight',
      nodeId: current,
      message: `Ajout de ${current} au tri (position ${result.length})`,
      visitedNodes: new Set(result),
      currentPath: [...result],
    };

    const outgoingEdges = graph.edges.filter((e) => e.from === current);

    for (const edge of outgoingEdges) {
      const degree = inDegree.get(edge.to)! - 1;
      inDegree.set(edge.to, degree);

      yield {
        type: 'edge',
        edgeFrom: edge.from,
        edgeTo: edge.to,
        message: `Réduction du degré entrant de ${edge.to} (maintenant: ${degree})`,
        visitedNodes: new Set(result),
      };

      if (degree === 0) {
        queue.push(edge.to);
      }
    }
  }

  if (result.length === graph.nodes.length) {
    yield {
      type: 'complete',
      message: `Tri topologique: ${result.join(' → ')}`,
      visitedNodes: new Set(result),
      currentPath: result,
    };
  } else {
    yield {
      type: 'complete',
      message: 'Le graphe contient un cycle! Tri impossible.',
      visitedNodes: new Set(result),
    };
  }
}
