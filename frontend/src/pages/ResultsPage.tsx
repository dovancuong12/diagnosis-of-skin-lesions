import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Case, PredictionJob } from '../types';
import { apiClient } from '../lib/api';
import { API_ENDPOINTS, QUERY_KEYS, SKIN_LESION_CLASSES } from '../constants';
import { getClassInfo, formatConfidence, formatDate } from '../utils';
import ImageCard from '../components/ImageCard';
import toast from 'react-hot-toast';

const ResultsPage = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Query for case data
  const { data: caseData, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: QUERY_KEYS.case(caseId || ''),
    queryFn: () => apiClient.get<Case>(API_ENDPOINTS.cases.detail(caseId || '')),
    enabled: !!caseId,
  });

  // Query for prediction job status (if we have a job ID instead of case ID)
  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: QUERY_KEYS.predictionJob(caseId || ''),
    queryFn: () => apiClient.get<PredictionJob>(API_ENDPOINTS.predictions.job(caseId || '')),
    enabled: !!caseId && !caseData,
    refetchInterval: (data) => {
      // Keep polling if job is still processing
      return data?.status === 'processing' || data?.status === 'pending' ? 2000 : false;
    },
  });

  useEffect(() => {
    // Redirect to case results when job is completed
    if (jobData?.status === 'completed' && jobData.caseId) {
      navigate(`/results/${jobData.caseId}`, { replace: true });
    }
  }, [jobData, navigate]);

  const isLoading = caseLoading || jobLoading;
  const currentCase = caseData;
  const currentJob = jobData;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentJob?.status === 'processing' ? 'Analyzing images...' : 'Loading results...'}
            </p>
          </div>
          {currentJob && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentJob.progress || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {currentJob.progress || 0}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (caseError || (!currentCase && !currentJob)) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Results Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested analysis results could not be found.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  // Show job status if still processing
  if (currentJob && currentJob.status !== 'completed') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            {currentJob.status === 'failed' ? (
              <>
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Analysis Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentJob.error || 'An error occurred during analysis.'}
                </p>
              </>
            ) : (
              <>
                <ClockIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Analysis in Progress
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please wait while we analyze your images...
                </p>
              </>
            )}
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return null;
  }

  const selectedImage = selectedImageId
    ? currentCase.images.find(img => img.id === selectedImageId)
    : currentCase.images[0];

  const selectedPrediction = selectedImage?.prediction;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cases')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analysis Results
              </h1>
              {currentCase.patientName && (
                <p className="text-gray-600 dark:text-gray-400">
                  Patient: {currentCase.patientName}
                  {currentCase.patientAge && ` (${currentCase.patientAge} years old)`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentCase.status === 'completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : currentCase.status === 'processing'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {currentCase.status === 'completed' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
              {currentCase.status === 'processing' && <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />}
              {currentCase.status.charAt(0).toUpperCase() + currentCase.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Image Detail */}
          {selectedImage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected Image
              </h2>
              <ImageCard
                image={selectedImage}
                prediction={selectedPrediction}
                showQC={true}
                showPrediction={true}
              />
            </div>
          )}

          {/* All Images Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              All Images ({currentCase.images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {currentCase.images.map((image) => (
                <div
                  key={image.id}
                  className={`cursor-pointer rounded-lg border-2 transition-colors ${
                    selectedImageId === image.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedImageId(image.id)}
                >
                  <ImageCard
                    image={image}
                    prediction={image.prediction}
                    showQC={false}
                    showPrediction={false}
                    className="border-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="space-y-6">
          {/* Case Summary */}
          {currentCase.fusedPrediction && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Case Summary
                </h2>
              </div>

              <div className="space-y-4">
                {currentCase.fusedPrediction.predictions.map((prediction, index) => {
                  const classInfo = getClassInfo(prediction.className);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: classInfo.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {classInfo.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {classInfo.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          prediction.confidence >= 0.8
                            ? 'text-green-600 dark:text-green-400'
                            : prediction.confidence >= 0.6
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatConfidence(prediction.confidence)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {prediction.confidence >= 0.8 ? 'High' : prediction.confidence >= 0.6 ? 'Medium' : 'Low'} confidence
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Case Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Case Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Case ID:</span>
                <span className="text-gray-900 dark:text-white font-mono">{currentCase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(currentCase.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Images:</span>
                <span className="text-gray-900 dark:text-white">{currentCase.images.length}</span>
              </div>
              {currentCase.patientGender && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{currentCase.patientGender}</span>
                </div>
              )}
              {currentCase.notes && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Notes:</span>
                  <p className="text-gray-900 dark:text-white text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {currentCase.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
