import { Graph, AlgorithmStep } from '../types/graph';

export function* prim(graph: Graph, startNodeId: string): Generator<AlgorithmStep> {
  const inMST = new Set<string>();
  const mstEdges: Array<{ from: string; to: string }> = [];

  inMST.add(startNodeId);

  yield {
    type: 'visit',
    nodeId: startNodeId,
    message: `Démarrage de l'algorithme de Prim depuis ${startNodeId}`,
    visitedNodes: new Set(inMST),
  };

  while (inMST.size < graph.nodes.length) {
    let minWeight = Infinity;
    let minEdge: { from: string; to: string } | null = null;

    for (const node of inMST) {
      const edges = graph.edges.filter(
        (e) => e.from === node || (!graph.directed && e.to === node)
      );

      for (const edge of edges) {
        const neighbor = edge.from === node ? edge.to : edge.from;

        if (!inMST.has(neighbor) && edge.weight < minWeight) {
          minWeight = edge.weight;
          minEdge = { from: node, to: neighbor };
        }
      }
    }

    if (!minEdge) break;

    inMST.add(minEdge.to);
    mstEdges.push(minEdge);

    yield {
      type: 'edge',
      edgeFrom: minEdge.from,
      edgeTo: minEdge.to,
      message: `Ajout de l'arête ${minEdge.from} → ${minEdge.to} (poids: ${minWeight})`,
      visitedNodes: new Set(inMST),
    };
  }

  yield {
    type: 'complete',
    message: `Arbre couvrant minimal trouvé! (${mstEdges.length} arêtes)`,
    visitedNodes: new Set(inMST),
  };
}
