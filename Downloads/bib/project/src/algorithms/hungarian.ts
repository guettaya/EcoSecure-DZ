import { AlgorithmStep, Node } from '../types/graph';

export function* hungarianAssignment(
  matrix: number[][],
  nodes: Node[]
): Generator<AlgorithmStep> {
  if (matrix.length === 0 || nodes.length === 0) {
    yield {
      type: 'complete',
      message: 'Veuillez créer une matrice de coûts!',
      visitedNodes: new Set(),
    };
    return;
  }

  yield {
    type: 'highlight',
    message: 'Démarrage de l\'algorithme d\'affectation (Hongrois)',
    visitedNodes: new Set(nodes.map((n) => n.id)),
  };

  const n = matrix.length;
  const used = Array(n).fill(false);
  const match = Array(n).fill(-1);
  const totalCost: number[] = [];

  for (let worker = 0; worker < n; worker++) {
    const minCost = Math.min(...matrix[worker]);
    for (let task = 0; task < n; task++) {
      if (matrix[worker][task] === minCost && !used[task]) {
        match[worker] = task;
        used[task] = true;
        totalCost.push(minCost);

        yield {
          type: 'visit',
          message: `Affectation: ${nodes[worker].label} → Tâche ${nodes[task].label} (coût: ${minCost})`,
          visitedNodes: new Set([nodes[worker].id, nodes[task].id]),
        };
        break;
      }
    }

    if (match[worker] === -1) {
      let bestTask = -1;
      let bestCost = Infinity;

      for (let task = 0; task < n; task++) {
        if (!used[task] && matrix[worker][task] < bestCost) {
          bestCost = matrix[worker][task];
          bestTask = task;
        }
      }

      if (bestTask !== -1) {
        match[worker] = bestTask;
        used[bestTask] = true;
        totalCost.push(bestCost);

        yield {
          type: 'visit',
          message: `Affectation: ${nodes[worker].label} → Tâche ${nodes[bestTask].label} (coût: ${bestCost})`,
          visitedNodes: new Set([nodes[worker].id, nodes[bestTask].id]),
        };
      }
    }
  }

  const cost = totalCost.reduce((a, b) => a + b, 0);

  yield {
    type: 'complete',
    message: `Affectation terminée (${match.filter((m) => m !== -1).length} affectations, coût total: ${cost})`,
    visitedNodes: new Set(nodes.map((n) => n.id)),
  };
}
