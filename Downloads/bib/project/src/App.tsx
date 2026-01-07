import { useState, useEffect, useRef } from 'react';
import { Graph, AlgorithmType, AlgorithmStep } from './types/graph';
import { exampleGraphs } from './utils/graphExamples';
import { GraphCanvas } from './components/GraphCanvas';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { Controls } from './components/Controls';
import { GraphEditor } from './components/GraphEditor';
import { MatrixInput } from './components/MatrixInput';
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { dijkstra } from './algorithms/dijkstra';
import { prim } from './algorithms/prim';
import { kruskal } from './algorithms/kruskal';
import { topologicalSort } from './algorithms/topological';
import { fordFulkerson } from './algorithms/fordFulkerson';
import { graphColoring } from './algorithms/graphColoring';
import { hungarianAssignment } from './algorithms/hungarian';
import { Network, Edit3, Play } from 'lucide-react';

function App() {
  const [selectedGraph, setSelectedGraph] = useState<string>('simple');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bfs');
  const [startNode, setStartNode] = useState<string>('A');
  const [endNode, setEndNode] = useState<string>('D');
  const [currentStep, setCurrentStep] = useState<AlgorithmStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [canPlay, setCanPlay] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [customGraph, setCustomGraph] = useState<Graph | null>(null);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [matrixNodes, setMatrixNodes] = useState<any[]>([]);
  const [finalResults, setFinalResults] = useState<Map<string, number> | null>(null);

  const generatorRef = useRef<Generator<AlgorithmStep> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const graph: Graph = isEditing || customGraph
    ? (customGraph || { nodes: [], edges: [], directed: false })
    : exampleGraphs[selectedGraph];

  useEffect(() => {
    if (graph.nodes.length > 0) {
      setStartNode(graph.nodes[0].id);
      if (graph.nodes.length > 1) {
        setEndNode(graph.nodes[graph.nodes.length - 1].id);
      }
    }
  }, [selectedGraph, graph.nodes]);

  useEffect(() => {
    resetAlgorithm();
  }, [selectedAlgorithm, selectedGraph, startNode, endNode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetAlgorithm = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(null);
    setCanPlay(true);
    setFinalResults(null);
    generatorRef.current = null;
  };

  const getAlgorithmGenerator = (): Generator<AlgorithmStep> => {
    switch (selectedAlgorithm) {
      case 'bfs':
        return bfs(graph, startNode);
      case 'dfs':
        return dfs(graph, startNode);
      case 'dijkstra':
        return dijkstra(graph, startNode);
      case 'prim':
        return prim(graph, startNode);
      case 'kruskal':
        return kruskal(graph);
      case 'topological':
        return topologicalSort(graph);
      case 'fordFulkerson':
        return fordFulkerson(graph, startNode, endNode);
      case 'graphColoring':
        return graphColoring(graph);
      case 'hungarian':
        return hungarianAssignment(matrixData, matrixNodes);
      default:
        return bfs(graph, startNode);
    }
  };

  const executeNextStep = () => {
    if (!generatorRef.current) {
      generatorRef.current = getAlgorithmGenerator();
    }

    const result = generatorRef.current.next();

    if (result.done) {
      setIsPlaying(false);
      setCanPlay(false);
      return false;
    }

    setCurrentStep(result.value);
    if (result.value.type === 'complete' && result.value.distances) {
      setFinalResults(result.value.distances);
    }
    return true;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    runAlgorithm();
  };

  const runAlgorithm = () => {
    if (!executeNextStep()) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      runAlgorithm();
    }, 1000 / speed);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleNext = () => {
    executeNextStep();
  };

  const handleReset = () => {
    resetAlgorithm();
  };

  const handleEditMode = () => {
    if (!isEditing) {
      setCustomGraph(JSON.parse(JSON.stringify(graph)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setCurrentStep(null);
      setCanPlay(true);
    }
  };

  const handleHungarianPlay = (matrix: number[][], nodes: any[]) => {
    setMatrixData(matrix);
    setMatrixNodes(nodes);
    setIsPlaying(true);
    generatorRef.current = hungarianAssignment(matrix, nodes);
    runAlgorithm();
  };

  const needsStartNode = !['kruskal', 'topological', 'graphColoring', 'hungarian'].includes(selectedAlgorithm);
  const needsEndNode = selectedAlgorithm === 'fordFulkerson';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Visualisation d'Algorithmes de Graphes
            </h1>
          </div>
          <p className="text-gray-600 text-base md:text-lg">
            Chapitres 3 à 6 - Exploration interactive des algorithmes classiques
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleEditMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Édition' : 'Éditer'}
            </button>
            <button
              onClick={() => {
                if (isEditing) handleEditMode();
              }}
              disabled={isEditing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                !isEditing
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Play className="w-4 h-4" />
              Visualiser
            </button>
          </div>
        </div>

        {isEditing ? (
          <GraphEditor
            graph={graph}
            onGraphChange={setCustomGraph}
            isEditing={isEditing}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Graphe
                </label>
                <select
                  value={selectedGraph}
                  onChange={(e) => setSelectedGraph(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="simple">Graphe Simple</option>
                  <option value="weighted">Graphe Pondéré</option>
                  <option value="directed">Graphe Orienté</option>
                </select>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Algorithme
                </label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value as AlgorithmType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <optgroup label="Chapitre 3 - Parcours">
                    <option value="bfs">BFS (Largeur)</option>
                    <option value="dfs">DFS (Profondeur)</option>
                  </optgroup>
                  <optgroup label="Chapitre 4 - Plus courts chemins">
                    <option value="dijkstra">Dijkstra</option>
                    <option value="topological">Tri Topologique</option>
                  </optgroup>
                  <optgroup label="Chapitre 5 - Arbres couvrants">
                    <option value="prim">Prim (MST)</option>
                    <option value="kruskal">Kruskal (MST)</option>
                  </optgroup>
                  <optgroup label="Chapitre 6 - Algorithmes avancés">
                    <option value="fordFulkerson">Ford-Fulkerson (Flot max)</option>
                    <option value="graphColoring">Coloration de graphe</option>
                    <option value="hungarian">Affectation (Hongrois)</option>
                  </optgroup>
                </select>
              </div>

              {needsStartNode && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {needsEndNode ? 'Nœud source' : 'Nœud de départ'}
                  </label>
                  <select
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        Nœud {node.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {needsEndNode && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nœud puits
                  </label>
                  <select
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        Nœud {node.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <AlgorithmInfo algorithm={selectedAlgorithm} />

            {selectedAlgorithm === 'fordFulkerson' && !graph.directed && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">
                  Ford-Fulkerson nécessite un graphe orienté!
                </p>
              </div>
            )}

            {selectedAlgorithm === 'graphColoring' && (graph.directed || graph.edges.some(e => e.capacity)) && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">
                  La coloration nécessite un graphe non orienté et non pondéré!
                </p>
              </div>
            )}

            <div className="mt-6 bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
              {selectedAlgorithm === 'hungarian' ? (
                <MatrixInput
                  graph={graph}
                  onRunAlgorithm={handleHungarianPlay}
                  isRunning={isPlaying}
                />
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <GraphCanvas
                      graph={graph}
                      visitedNodes={currentStep?.visitedNodes}
                      highlightedNode={currentStep?.nodeId}
                      highlightedEdge={
                        currentStep?.edgeFrom && currentStep?.edgeTo
                          ? { from: currentStep.edgeFrom, to: currentStep.edgeTo }
                          : undefined
                      }
                      distances={currentStep?.distances}
                      flowData={currentStep?.flowData}
                    />
                  </div>
                </>
              )}

              {selectedAlgorithm !== 'hungarian' && (
                <>
                  {currentStep && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-800 font-medium">{currentStep.message}</p>
                      {currentStep.currentPath && currentStep.currentPath.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Chemin: {currentStep.currentPath.join(' → ')}
                        </p>
                      )}
                      {currentStep.type === 'complete' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 font-semibold">Algorithme terminé</p>
                          {finalResults && ['dijkstra', 'bfs', 'dfs'].includes(selectedAlgorithm) && (
                            <div className="mt-3 space-y-1 text-sm">
                              <p className="font-semibold text-green-900">Distances depuis {startNode}:</p>
                              {Array.from(finalResults.entries()).map(([nodeId, distance]) => (
                                <p key={nodeId} className="text-green-800">
                                  → Nœud {nodeId}: {distance === Infinity ? '∞ (inaccessible)' : distance}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Controls
                    isPlaying={isPlaying}
                    canPlay={canPlay}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onReset={handleReset}
                    onNext={handleNext}
                    speed={speed}
                    onSpeedChange={setSpeed}
                  />
                </>
              )}

              {selectedAlgorithm === 'hungarian' && currentStep && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800 font-medium">{currentStep.message}</p>
                  {currentStep.type === 'complete' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-semibold">Affectation terminée</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-400"></div>
              <span className="text-sm font-medium text-gray-700">Non visité</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-700"></div>
              <span className="text-sm font-medium text-gray-700">Visité</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-800"></div>
              <span className="text-sm font-medium text-gray-700">En cours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
