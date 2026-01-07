import { Graph, AlgorithmStep } from '../types/graph';

class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    nodes.forEach((node) => {
      this.parent.set(node, node);
      this.rank.set(node, 0);
    });
  }

  find(x: string): string {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }
}

export function* kruskal(graph: Graph): Generator<AlgorithmStep> {
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(graph.nodes.map((n) => n.id));
  const mstEdges: Array<{ from: string; to: string }> = [];
  const processed = new Set<string>();

  yield {
    type: 'highlight',
    message: `Démarrage de l'algorithme de Kruskal (${sortedEdges.length} arêtes triées)`,
    visitedNodes: new Set(),
  };

  for (const edge of sortedEdges) {
    processed.add(edge.from);
    processed.add(edge.to);

    if (uf.find(edge.from) !== uf.find(edge.to)) {
      uf.union(edge.from, edge.to);
      mstEdges.push({ from: edge.from, to: edge.to });

      yield {
        type: 'edge',
        edgeFrom: edge.from,
        edgeTo: edge.to,
        message: `Ajout de l'arête ${edge.from} → ${edge.to} (poids: ${edge.weight})`,
        visitedNodes: new Set(processed),
      };
    } else {
      yield {
        type: 'highlight',
        message: `Arête ${edge.from} → ${edge.to} rejetée (créerait un cycle)`,
        visitedNodes: new Set(processed),
      };
    }

    if (mstEdges.length === graph.nodes.length - 1) break;
  }

  yield {
    type: 'complete',
    message: `Arbre couvrant minimal trouvé! (${mstEdges.length} arêtes)`,
    visitedNodes: new Set(processed),
  };
}
