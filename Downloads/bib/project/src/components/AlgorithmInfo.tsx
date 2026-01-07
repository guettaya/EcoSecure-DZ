import { AlgorithmType } from '../types/graph';
import { Info } from 'lucide-react';

interface AlgorithmInfoProps {
  algorithm: AlgorithmType;
}

const algorithmDetails: Record<
  AlgorithmType,
  { name: string; complexity: string; description: string; chapter: string; requirements: string }
> = {
  bfs: {
    name: 'Parcours en Largeur (BFS)',
    complexity: 'O(V + E)',
    description:
      'Explore le graphe niveau par niveau en utilisant une file. Idéal pour trouver le plus court chemin dans un graphe non pondéré.',
    chapter: 'Chapitre 3',
    requirements: 'Graphe orienté et pondéré',
  },
  dfs: {
    name: 'Parcours en Profondeur (DFS)',
    complexity: 'O(V + E)',
    description:
      "Explore le graphe en profondeur avant d'explorer en largeur. Utilise une pile (récursion). Utile pour détecter les cycles et la connectivité.",
    chapter: 'Chapitre 3',
    requirements: 'Graphe orienté et pondéré',
  },
  dijkstra: {
    name: 'Algorithme de Dijkstra',
    complexity: 'O((V + E) log V)',
    description:
      'Trouve le plus court chemin depuis un nœud source vers tous les autres nœuds dans un graphe pondéré avec des poids positifs.',
    chapter: 'Chapitre 4',
    requirements: 'Graphe orienté et pondéré',
  },
  prim: {
    name: 'Algorithme de Prim',
    complexity: 'O(E log V)',
    description:
      "Construit un arbre couvrant minimal en ajoutant progressivement l'arête de poids minimum qui connecte un nouveau nœud.",
    chapter: 'Chapitre 5',
    requirements: 'Graphe non orienté et pondéré',
  },
  kruskal: {
    name: 'Algorithme de Kruskal',
    complexity: 'O(E log E)',
    description:
      "Construit un arbre couvrant minimal en triant toutes les arêtes et en les ajoutant si elles ne créent pas de cycle (Union-Find).",
    chapter: 'Chapitre 5',
    requirements: 'Graphe non orienté et pondéré',
  },
  topological: {
    name: 'Tri Topologique',
    complexity: 'O(V + E)',
    description:
      'Ordonne les nœuds d\'un graphe orienté acyclique (DAG) de sorte que pour chaque arête (u, v), u vient avant v.',
    chapter: 'Chapitre 4',
    requirements: 'Graphe orienté et acyclique',
  },
  fordFulkerson: {
    name: 'Algorithme de Ford-Fulkerson',
    complexity: 'O(E × f)',
    description:
      'Trouve le flot maximal dans un réseau de transport en cherchant des chemins augmentants de la source au puits. f représente le flot maximal.',
    chapter: 'Chapitre 6',
    requirements: 'Graphe orienté et pondéré (capacités)',
  },
  graphColoring: {
    name: 'Coloration de Graphe (Welsh-Powell)',
    complexity: 'O(V²)',
    description:
      'Attribue des couleurs aux nœuds de sorte que deux nœuds adjacents aient des couleurs différentes, en minimisant le nombre de couleurs utilisées.',
    chapter: 'Chapitre 6',
    requirements: 'Graphe non orienté et non pondéré',
  },
  hungarian: {
    name: 'Algorithme d\'Affectation (Hongrois simplifié)',
    complexity: 'O(V × E)',
    description:
      'Résout le problème d\'affectation optimal en utilisant une matrice de coûts. Entrez les coûts dans la matrice puis exécutez.',
    chapter: 'Chapitre 6',
    requirements: 'Matrice de coûts carrée',
  },
};

export function AlgorithmInfo({ algorithm }: AlgorithmInfoProps) {
  const info = algorithmDetails[algorithm];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 md:p-6 shadow-sm border border-blue-100">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
            <h3 className="text-base md:text-lg font-bold text-gray-900">{info.name}</h3>
            <span className="text-xs md:text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full w-fit">
              {info.chapter}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-700 mb-3 leading-relaxed">
            {info.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Complexité:</span>
              <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-800">
                {info.complexity}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Exigences:</span>
              <span className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                {info.requirements}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
