import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function Controls({
  isPlaying,
  canPlay,
  onPlay,
  onPause,
  onReset,
  onNext,
  speed,
  onSpeedChange,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {isPlaying ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={!canPlay}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Démarrer
            </button>
          )}

          <button
            onClick={onNext}
            disabled={!canPlay}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <SkipForward className="w-4 h-4" />
            Suivant
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3 ml-4">
          <label className="text-sm font-medium text-gray-700">Vitesse:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="text-sm font-medium text-gray-600 w-12">
            {speed}x
          </span>
        </div>
      </div>
    </div>
  );
}
