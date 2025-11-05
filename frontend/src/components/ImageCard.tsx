import { useState } from 'react';
import {
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CaseImage, Prediction } from '../types';
import { getClassInfo, formatConfidence, formatDate } from '../utils';
import QCIndicator from './QCIndicator';
import HeatmapOverlay from './HeatmapOverlay';

interface ImageCardProps {
  image: CaseImage;
  prediction?: Prediction;
  showQC?: boolean;
  showPrediction?: boolean;
  onImageClick?: (image: CaseImage) => void;
  className?: string;
}

const ImageCard = ({
  image,
  prediction,
  showQC = true,
  showPrediction = true,
  onImageClick,
  className = ''
}: ImageCardProps) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(image);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = () => {
    if (!prediction) {
      return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }

    if (prediction.confidence >= 0.8) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }

    return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
  };

  const topPrediction = prediction?.predictions[0];
  const classInfo = topPrediction ? getClassInfo(topPrediction.className) : null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square group cursor-pointer" onClick={handleImageClick}>
        <img
          src={image.thumbnailUrl || image.imageUrl}
          alt={image.filename}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}

        {/* Heatmap Overlay */}
        {showHeatmap && prediction?.heatmapUrl && (
          <HeatmapOverlay
            imageUrl={image.imageUrl}
            heatmapUrl={prediction.heatmapUrl}
            onClose={() => setShowHeatmap(false)}
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageClick();
              }}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="View full size"
            >
              <EyeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Download image"
            >
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            {prediction?.heatmapUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHeatmap(true);
                }}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Show heatmap"
              >
                <div className="h-5 w-5 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* File Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {image.filename}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Uploaded {formatDate(image.uploadedAt)}
          </p>
        </div>

        {/* Quality Control */}
        {showQC && image.qcResults && (
          <QCIndicator qcResults={image.qcResults} compact />
        )}

        {/* Prediction Results */}
        {showPrediction && prediction && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Prediction
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(prediction.createdAt)}
              </span>
            </div>

            {topPrediction && classInfo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: classInfo.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {classInfo.name}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    topPrediction.confidence >= 0.8
                      ? 'text-green-600 dark:text-green-400'
                      : topPrediction.confidence >= 0.6
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatConfidence(topPrediction.confidence)}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {classInfo.description}
                </p>

                {/* Additional predictions */}
                {prediction.predictions.length > 1 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Other possibilities:
                    </p>
                    {prediction.predictions.slice(1, 3).map((pred, index) => {
                      const info = getClassInfo(pred.className);
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {info.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatConfidence(pred.confidence)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Prediction State */}
        {showPrediction && !prediction && (
          <div className="text-center py-2">
            <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analysis pending...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
