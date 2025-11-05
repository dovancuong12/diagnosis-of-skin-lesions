import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { QualityControlResults } from '../types';

interface QCIndicatorProps {
  qcResults: QualityControlResults;
  showDetails?: boolean;
  compact?: boolean;
}

const QCIndicator = ({ qcResults, showDetails = false, compact = false }: QCIndicatorProps) => {
  const getStatusIcon = () => {
    if (!qcResults.isAcceptable) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (qcResults.warnings.length > 0) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  };

  const getMetricColor = (value: number, type: 'brightness' | 'contrast' | 'blur') => {
    switch (type) {
      case 'brightness':
        if (value < 10 || value > 245) return 'text-red-500';
        if (value < 50 || value > 200) return 'text-yellow-500';
        return 'text-green-500';
      case 'contrast':
        if (value < 0.1) return 'text-red-500';
        if (value < 0.3) return 'text-yellow-500';
        return 'text-green-500';
      case 'blur':
        if (value > 100) return 'text-red-500';
        if (value < 200) return 'text-yellow-500';
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = () => {
    if (!qcResults.isAcceptable) {
      return 'Poor Quality';
    }
    if (qcResults.warnings.length > 0) {
      return 'Fair Quality';
    }
    return 'Good Quality';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusLabel()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Image Quality
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Quality Metrics */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Brightness</span>
              <span className={`text-sm font-medium ${getMetricColor(qcResults.brightness, 'brightness')}`}>
                {qcResults.brightness.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  qcResults.brightness < 10 || qcResults.brightness > 245
                    ? 'bg-red-500'
                    : qcResults.brightness < 50 || qcResults.brightness > 200
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (qcResults.brightness / 255) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Contrast</span>
              <span className={`text-sm font-medium ${
                qcResults.contrast < 0.1
                  ? 'text-red-500'
                  : qcResults.contrast < 0.3
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}>
                {qcResults.contrast.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  qcResults.contrast < 0.1
                    ? 'bg-red-500'
                    : qcResults.contrast < 0.3
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, qcResults.contrast * 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sharpness</span>
              <span className={`text-sm font-medium ${
                qcResults.blur > 100
                  ? 'text-red-500'
                  : qcResults.blur < 200
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}>
                {qcResults.blur.toFixed(0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  qcResults.blur > 100
                    ? 'bg-red-500'
                    : qcResults.blur < 200
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (qcResults.blur / 500) * 100))}%` }}
              />
            </div>
          </div>

          {/* Warnings */}
          {qcResults.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Quality Warnings
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {qcResults.warnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {!qcResults.isAcceptable && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mt-3">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Image Quality Issues
                  </h4>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    This image may not produce reliable results. Consider retaking the photo with better lighting and focus.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default QCIndicator;
