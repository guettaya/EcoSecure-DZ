import { useState, useEffect } from 'react';
import { Graph, Node } from '../types/graph';
import { Play, RotateCcw, Plus, Minus } from 'lucide-react';

interface MatrixInputProps {
  graph: Graph;
  onRunAlgorithm: (matrix: number[][], nodes: Node[]) => void;
  isRunning: boolean;
}

export function MatrixInput({ graph, onRunAlgorithm, isRunning }: MatrixInputProps) {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (graph.nodes.length === 0) return;

    const newNodes = graph.nodes;
    const size = newNodes.length;
    const newMatrix = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    setNodes(newNodes);
    setMatrix(newMatrix);
  }, [graph.nodes]);

  const handleMatrixChange = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMatrix = matrix.map((r) => [...r]);
    newMatrix[row][col] = Math.max(0, numValue);
    setMatrix(newMatrix);
  };

  const handleAddRow = () => {
    const size = matrix.length + 1;
    const newMatrix = Array(size)
      .fill(null)
      .map((_, i) =>
        i < matrix.length
          ? [...matrix[i], 0]
          : Array(size).fill(0)
      );
    setMatrix(newMatrix);

    const newNode: Node = {
      id: String(Math.max(...nodes.map(n => parseInt(n.id) || 0), 0) + 1),
      label: String(size),
      x: 0,
      y: 0,
    };
    setNodes([...nodes, newNode]);
  };

  const handleRemoveRow = () => {
    if (matrix.length <= 1) return;

    const newMatrix = matrix.slice(0, -1).map((row) => row.slice(0, -1));
    setMatrix(newMatrix);
    setNodes(nodes.slice(0, -1));
  };

  const handleReset = () => {
    const newMatrix = matrix.map(() => Array(matrix[0].length).fill(0));
    setMatrix(newMatrix);
  };

  const handleExecute = () => {
    onRunAlgorithm(matrix, nodes);
  };

  if (nodes.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Créez d'abord des nœuds dans le graphe</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Matrice de coûts d'affectation
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Entrez les coûts dans la matrice. Les lignes représentent les travailleurs et les colonnes les tâches.
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-12 h-10 bg-gray-100 border border-gray-300"></th>
                {nodes.map((node) => (
                  <th
                    key={node.id}
                    className="w-20 h-10 bg-gray-100 border border-gray-300 text-center font-semibold text-sm"
                  >
                    {node.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map((rowNode, rowIdx) => (
                <tr key={rowNode.id}>
                  <th className="bg-gray-100 border border-gray-300 text-center font-semibold text-sm">
                    {rowNode.label}
                  </th>
                  {nodes.map((colNode, colIdx) => (
                    <td key={`${rowNode.id}-${colNode.id}`} className="border border-gray-300 p-0">
                      <input
                        type="number"
                        value={matrix[rowIdx]?.[colIdx] || 0}
                        onChange={(e) => handleMatrixChange(rowIdx, colIdx, e.target.value)}
                        className="w-20 h-10 text-center border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="0"
                        disabled={isRunning}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRow}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter ligne/colonne
            </button>
            <button
              onClick={handleRemoveRow}
              disabled={isRunning || matrix.length <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Minus className="w-4 h-4" />
              Supprimer ligne/colonne
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Exécuter
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
