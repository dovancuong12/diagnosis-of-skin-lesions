import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface HeatmapOverlayProps {
  imageUrl: string;
  heatmapUrl: string;
  onClose: () => void;
  opacity?: number;
}

const HeatmapOverlay = ({
  imageUrl,
  heatmapUrl,
  onClose,
  opacity = 0.6
}: HeatmapOverlayProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentOpacity, setCurrentOpacity] = useState(opacity);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [heatmapLoaded, setHeatmapLoaded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, onClose]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={overlayRef}
        className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'max-w-4xl max-h-[90vh] w-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            GradCAM Visualization
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Heatmap Opacity:
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentOpacity}
                onChange={(e) => setCurrentOpacity(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                {Math.round(currentOpacity * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHeatmap"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showHeatmap" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Heatmap
              </label>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-96 sm:h-[500px]'} overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Original Image */}
            <img
              src={imageUrl}
              alt="Original"
              className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Heatmap Overlay */}
            {showHeatmap && (
              <img
                src={heatmapUrl}
                alt="Heatmap"
                className={`absolute inset-0 max-w-full max-h-full object-contain mix-blend-multiply transition-opacity duration-200 ${
                  heatmapLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ opacity: currentOpacity }}
                onLoad={() => setHeatmapLoaded(true)}
              />
            )}

            {/* Loading States */}
            {(!imageLoaded || (showHeatmap && !heatmapLoaded)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading visualization...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Attention Map
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Red areas indicate regions most important for the prediction
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Low</span>
              <div className="w-16 h-2 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapOverlay;
