import { Graph, AlgorithmStep } from '../types/graph';

export function* graphColoring(graph: Graph): Generator<AlgorithmStep> {
  const nodeColors: Map<string, number> = new Map();
  const nodeDegrees: Map<string, number> = new Map();

  yield {
    type: 'highlight',
    message: 'Démarrage de la coloration de graphe (Welsh-Powell)',
    visitedNodes: new Set(),
  };

  graph.nodes.forEach((node) => {
    const degree = graph.edges.filter(
      (e) => e.from === node.id || (!graph.directed && e.to === node.id)
    ).length;
    nodeDegrees.set(node.id, degree);
  });

  const sortedNodes = [...graph.nodes].sort(
    (a, b) => (nodeDegrees.get(b.id) || 0) - (nodeDegrees.get(a.id) || 0)
  );

  yield {
    type: 'visit',
    message: `Tri des nœuds par degré décroissant`,
    visitedNodes: new Set(sortedNodes.map((n) => n.id)),
  };

  let currentColor = 0;

  for (const node of sortedNodes) {
    if (nodeColors.has(node.id)) continue;

    const neighborColors = new Set<number>();

    const neighbors = graph.edges
      .filter((e) => {
        if (graph.directed) {
          return e.from === node.id || e.to === node.id;
        } else {
          return e.from === node.id || e.to === node.id;
        }
      })
      .map((e) => (e.from === node.id ? e.to : e.from));

    for (const neighbor of neighbors) {
      if (nodeColors.has(neighbor)) {
        neighborColors.add(nodeColors.get(neighbor)!);
      }
    }

    let assignedColor = 0;
    while (neighborColors.has(assignedColor)) {
      assignedColor++;
    }

    nodeColors.set(node.id, assignedColor);
    currentColor = Math.max(currentColor, assignedColor);

    yield {
      type: 'visit',
      nodeId: node.id,
      message: `Nœud ${node.id} coloré avec la couleur ${assignedColor + 1}`,
      visitedNodes: new Set(Array.from(nodeColors.keys())),
    };
  }

  yield {
    type: 'complete',
    message: `Coloration terminée avec ${currentColor + 1} couleurs`,
    visitedNodes: new Set(Array.from(nodeColors.keys())),
  };
}
