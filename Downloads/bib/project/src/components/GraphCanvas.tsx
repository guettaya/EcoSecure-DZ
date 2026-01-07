import { useEffect, useRef } from 'react';
import { Graph, Node, Edge } from '../types/graph';

interface GraphCanvasProps {
  graph: Graph;
  visitedNodes?: Set<string>;
  highlightedNode?: string;
  highlightedEdge?: { from: string; to: string };
  distances?: Map<string, number>;
  flowData?: Map<string, Map<string, number>>;
}

export function GraphCanvas({
  graph,
  visitedNodes = new Set(),
  highlightedNode,
  highlightedEdge,
  distances,
  flowData,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(600, Math.max(400, containerWidth * 0.6));

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawEdges(ctx, graph.edges, graph.nodes, graph.directed, highlightedEdge, flowData);
      drawNodes(ctx, graph.nodes, visitedNodes, highlightedNode, distances);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [graph, visitedNodes, highlightedNode, highlightedEdge, distances, flowData]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-200 rounded-lg bg-white shadow-sm w-full"
      />
    </div>
  );
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  edges: Edge[],
  nodes: Node[],
  directed: boolean,
  highlightedEdge?: { from: string; to: string },
  flowData?: Map<string, Map<string, number>>
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  edges.forEach((edge) => {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) return;

    const isHighlighted =
      highlightedEdge &&
      ((highlightedEdge.from === edge.from && highlightedEdge.to === edge.to) ||
        (!directed &&
          highlightedEdge.from === edge.to &&
          highlightedEdge.to === edge.from));

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#94a3b8';
    ctx.lineWidth = isHighlighted ? 3 : 2;
    ctx.stroke();

    if (directed || edge.directed) {
      drawArrow(ctx, from.x, from.y, to.x, to.y, isHighlighted);
    }

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    if (flowData && edge.capacity) {
      const flow = flowData.get(edge.from)?.get(edge.to) || 0;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${flow}/${edge.capacity}`, midX + 5, midY - 5);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(edge.weight.toString(), midX + 5, midY - 5);
    }
  });
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  isHighlighted: boolean
) {
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
  ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#94a3b8';
  ctx.lineWidth = isHighlighted ? 3 : 2;
  ctx.stroke();
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  visitedNodes: Set<string>,
  highlightedNode?: string,
  distances?: Map<string, number>
) {
  nodes.forEach((node) => {
    const isVisited = visitedNodes.has(node.id);
    const isHighlighted = highlightedNode === node.id;

    ctx.beginPath();
    ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
    ctx.fillStyle = isHighlighted
      ? '#3b82f6'
      : isVisited
      ? '#10b981'
      : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = isHighlighted ? '#1e40af' : isVisited ? '#059669' : '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = isVisited || isHighlighted ? '#ffffff' : '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);

    if (distances && distances.has(node.id)) {
      const dist = distances.get(node.id)!;
      const distText = dist === Infinity ? '∞' : dist.toString();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(distText, node.x, node.y - 40);
    }
  });
}
