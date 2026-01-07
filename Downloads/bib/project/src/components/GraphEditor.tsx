import { useRef, useState, useEffect } from 'react';
import { Graph, Node, Edge } from '../types/graph';
import { Trash2, Link2, Plus } from 'lucide-react';

interface GraphEditorProps {
  graph: Graph;
  onGraphChange: (graph: Graph) => void;
  isEditing: boolean;
}

export function GraphEditor({ graph, onGraphChange, isEditing }: GraphEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [edgeCapacity, setEdgeCapacity] = useState<number>(1);
  const [directedEdge, setDirectedEdge] = useState<boolean>(graph.directed);
  const [nextNodeId, setNextNodeId] = useState<number>(
    Math.max(...graph.nodes.map((n) => parseInt(n.id) || 0), 0) + 1
  );

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(600, Math.max(400, containerWidth * 0.6));

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      drawGraph();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [graph, selectedNodes, hoveredNode, isEditing]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEdges(ctx);
    drawNodes(ctx);
  };

  const drawEdges = (ctx: CanvasRenderingContext2D) => {
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

    graph.edges.forEach((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (graph.directed || edge.directed) {
        drawArrow(ctx, from.x, from.y, to.x, to.y);
      }

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(edge.weight.toString(), midX + 5, midY - 5);
    });
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    const arrowX = toX - 25 * Math.cos(angle);
    const arrowY = toY - 25 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - headlen * Math.cos(angle - Math.PI / 6),
      arrowY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - headlen * Math.cos(angle + Math.PI / 6),
      arrowY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawNodes = (ctx: CanvasRenderingContext2D) => {
    graph.nodes.forEach((node) => {
      const isSelected = selectedNodes.includes(node.id);
      const isHovered = hoveredNode === node.id;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected
        ? '#ef4444'
        : isHovered && isEditing
        ? '#fbbf24'
        : '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#991b1b' : isHovered && isEditing ? '#b45309' : '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = isSelected || (isHovered && isEditing) ? '#ffffff' : '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const clickedNode = graph.nodes.find(
      (node) => Math.hypot(node.x - x, node.y - y) < 25
    );

    if (clickedNode) {
      if (selectedNodes.includes(clickedNode.id)) {
        setSelectedNodes(selectedNodes.filter((id) => id !== clickedNode.id));
      } else {
        if (selectedNodes.length < 2) {
          setSelectedNodes([...selectedNodes, clickedNode.id]);
        } else {
          setSelectedNodes([clickedNode.id]);
        }
      }
    } else {
      const newNode: Node = {
        id: String(nextNodeId),
        label: String(nextNodeId),
        x: x,
        y: y,
      };
      onGraphChange({
        ...graph,
        nodes: [...graph.nodes, newNode],
      });
      setNextNodeId(nextNodeId + 1);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) {
      setHoveredNode(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const hoveredNodeId = graph.nodes.find(
      (node) => Math.hypot(node.x - x, node.y - y) < 25
    )?.id;

    setHoveredNode(hoveredNodeId || null);
  };

  const createEdge = () => {
    if (selectedNodes.length !== 2) return;

    const newEdge: Edge = {
      from: selectedNodes[0],
      to: selectedNodes[1],
      weight: edgeWeight,
      directed: directedEdge,
      capacity: edgeCapacity,
    };

    const edgeExists = graph.edges.some(
      (e) =>
        (e.from === newEdge.from && e.to === newEdge.to) ||
        (!directedEdge && e.from === newEdge.to && e.to === newEdge.from)
    );

    if (!edgeExists) {
      onGraphChange({
        ...graph,
        edges: [...graph.edges, newEdge],
      });
    }

    setSelectedNodes([]);
  };

  const deleteSelectedNode = () => {
    if (selectedNodes.length === 0) return;

    const nodeIdToDelete = selectedNodes[0];

    onGraphChange({
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== nodeIdToDelete),
      edges: graph.edges.filter(
        (e) => e.from !== nodeIdToDelete && e.to !== nodeIdToDelete
      ),
    });

    setSelectedNodes([]);
  };

  const deleteSelectedEdge = () => {
    if (selectedNodes.length !== 2) return;

    const [from, to] = selectedNodes;

    onGraphChange({
      ...graph,
      edges: graph.edges.filter(
        (e) =>
          !(
            (e.from === from && e.to === to) ||
            (!graph.directed && e.from === to && e.to === from)
          )
      ),
    });

    setSelectedNodes([]);
  };

  const clearGraph = () => {
    onGraphChange({
      ...graph,
      nodes: [],
      edges: [],
    });
    setSelectedNodes([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <Plus className="w-5 h-5 text-amber-600" />
        <span className="text-sm text-amber-700 font-medium">
          Mode édition: Cliquez sur le canvas pour ajouter des nœuds
        </span>
      </div>

      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair shadow-sm w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nœuds sélectionnés: {selectedNodes.length}
            </label>
            {selectedNodes.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {selectedNodes.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                  >
                    Nœud {id}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {selectedNodes.length === 1 && (
              <button
                onClick={deleteSelectedNode}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer nœud
              </button>
            )}

            {selectedNodes.length === 2 && (
              <>
                <button
                  onClick={deleteSelectedEdge}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer arête
                </button>
                <button
                  onClick={createEdge}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Créer arête
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Poids de l'arête
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(parseInt(e.target.value) || 1)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Capacité de l'arête
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={edgeCapacity}
              onChange={(e) => setEdgeCapacity(parseInt(e.target.value) || 1)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Type d'arête
          </label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDirectedEdge(false)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                !directedEdge
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Non orientée
            </button>
            <button
              onClick={() => setDirectedEdge(true)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                directedEdge
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Orientée (Arc)
            </button>
          </div>

          <button
            onClick={clearGraph}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Effacer le graphe
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Statistiques:</p>
            <p>Nœuds: {graph.nodes.length}</p>
            <p>Arêtes: {graph.edges.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
