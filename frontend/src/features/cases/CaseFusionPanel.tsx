import { useState } from 'react';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Case, Prediction, ClassPrediction } from '../../types';
import { getClassInfo, formatConfidence } from '../../utils';
import { SKIN_LESION_CLASSES } from '../../constants';

interface CaseFusionPanelProps {
  caseData: Case;
  onFusionUpdate?: (fusedPrediction: Prediction) => void;
  className?: string;
}

type FusionMethod = 'average' | 'weighted' | 'majority' | 'max_confidence';

const CaseFusionPanel = ({ caseData, onFusionUpdate, className = '' }: CaseFusionPanelProps) => {
  const [fusionMethod, setFusionMethod] = useState<FusionMethod>('weighted');
  const [showSettings, setShowSettings] = useState(false);
  const [qualityThreshold, setQualityThreshold] = useState(0.7);

  // Get all predictions from images
  const imagePredictions = caseData.images
    .filter(img => img.prediction && img.qcResults?.isAcceptable)
    .map(img => ({
      prediction: img.prediction!,
      qcScore: getQualityScore(img.qcResults!)
    }));

  // Calculate quality score from QC results
  function getQualityScore(qcResults: any): number {
    if (!qcResults.isAcceptable) return 0;

    let score = 1.0;

    // Penalize based on warnings
    score -= qcResults.warnings.length * 0.1;

    // Adjust based on specific metrics
    const brightnessScore = Math.max(0, 1 - Math.abs(qcResults.brightness - 127.5) / 127.5);
    const contrastScore = Math.min(1, qcResults.contrast / 0.5);
    const sharpnessScore = Math.min(1, qcResults.blur / 200);

    score = (score + brightnessScore + contrastScore + sharpnessScore) / 4;

    return Math.max(0, Math.min(1, score));
  }

  // Fusion algorithms
  const fusePredictions = (): ClassPrediction[] => {
    if (imagePredictions.length === 0) return [];

    const classScores: { [key: string]: number[] } = {};
    const classWeights: { [key: string]: number[] } = {};

    // Collect all predictions and weights
    imagePredictions.forEach(({ prediction, qcScore }) => {
      prediction.predictions.forEach(classPred => {
        if (!classScores[classPred.className]) {
          classScores[classPred.className] = [];
          classWeights[classPred.className] = [];
        }
        classScores[classPred.className].push(classPred.confidence);
        classWeights[classPred.className].push(qcScore);
      });
    });

    // Apply fusion method
    const fusedScores: { [key: string]: number } = {};

    Object.keys(classScores).forEach(className => {
      const scores = classScores[className];
      const weights = classWeights[className];

      switch (fusionMethod) {
        case 'average':
          fusedScores[className] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          break;

        case 'weighted':
          const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
          const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
          fusedScores[className] = totalWeight > 0 ? weightedSum / totalWeight : 0;
          break;

        case 'majority':
          // Count how many predictions have this class as top prediction
          const votes = imagePredictions.filter(({ prediction }) =>
            prediction.predictions[0]?.className === className
          ).length;
          fusedScores[className] = votes / imagePredictions.length;
          break;

        case 'max_confidence':
          fusedScores[className] = Math.max(...scores);
          break;
      }
    });

    // Convert to ClassPrediction array and sort by confidence
    return Object.entries(fusedScores)
      .map(([className, confidence]) => ({
        className: className as any,
        confidence,
        description: getClassInfo(className as any).description
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 predictions
  };

  const fusedPredictions = fusePredictions();
  const topPrediction = fusedPredictions[0];

  const getFusionMethodDescription = (method: FusionMethod): string => {
    switch (method) {
      case 'average':
        return 'Simple average of all predictions';
      case 'weighted':
        return 'Weighted average based on image quality';
      case 'majority':
        return 'Most frequent top prediction wins';
      case 'max_confidence':
        return 'Highest confidence prediction wins';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Case Fusion Analysis
          </h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fusion Method
              </label>
              <select
                value={fusionMethod}
                onChange={(e) => setFusionMethod(e.target.value as FusionMethod)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="weighted">Weighted Average</option>
                <option value="average">Simple Average</option>
                <option value="majority">Majority Vote</option>
                <option value="max_confidence">Max Confidence</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {getFusionMethodDescription(fusionMethod)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality Threshold: {qualityThreshold.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={qualityThreshold}
                onChange={(e) => setQualityThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum quality score for images to be included in fusion
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {imagePredictions.length === 0 ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Valid Predictions
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              No images with acceptable quality and predictions found for fusion analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fusion Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Fused Prediction Results
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Based on {imagePredictions.length} images
                </span>
              </div>

              {topPrediction && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getClassInfo(topPrediction.className).color }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getClassInfo(topPrediction.className).name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Primary diagnosis
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        topPrediction.confidence >= 0.8
                          ? 'text-green-600 dark:text-green-400'
                          : topPrediction.confidence >= 0.6
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatConfidence(topPrediction.confidence)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {topPrediction.confidence >= 0.8 ? 'High' : topPrediction.confidence >= 0.6 ? 'Medium' : 'Low'} confidence
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Predictions */}
              <div className="space-y-2">
                {fusedPredictions.map((prediction, index) => {
                  const classInfo = getClassInfo(prediction.className);
                  return (
                    <div
                      key={prediction.className}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-4">
                          {index + 1}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: classInfo.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {classInfo.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {classInfo.severity} severity
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatConfidence(prediction.confidence)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Image Contributions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Individual Image Contributions
              </h4>
              <div className="space-y-2">
                {imagePredictions.map(({ prediction, qcScore }, index) => {
                  const topClass = prediction.predictions[0];
                  const classInfo = getClassInfo(topClass.className);

                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: classInfo.color }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Image {index + 1}: {classInfo.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatConfidence(topClass.confidence)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          (Q: {qcScore.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Fusion Analysis
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    This analysis combines predictions from multiple images to provide a more robust diagnosis.
                    The {fusionMethod.replace('_', ' ')} method was used with quality weighting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseFusionPanel;
