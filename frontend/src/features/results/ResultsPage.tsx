import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { API_ENDPOINTS } from '../../constants';
import PredictionResult from '../upload/PredictionResult';

interface PredictionRecord {
  id: string;
  filename: string;
  prediction: string;
  created_at: string;
  message: string;
  originalFilename?: string; // Tên file gốc từ người dùng
}

const ResultsPage = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      try {
        console.log('Fetching prediction history from:', API_ENDPOINTS.ml.history);
        const response = await apiClient.get<{predictions: PredictionRecord[]}>(API_ENDPOINTS.ml.history);
        console.log('Received response:', response);
        setPredictions(response.predictions || []);
      } catch (err) {
        console.error('Error fetching prediction history:', err);
        setError('Failed to load prediction history: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchPredictionHistory();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prediction History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prediction History</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prediction History</h1>
      
      {predictions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            No prediction history available yet. Make a prediction to see results here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {predictions.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Prediction Result</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-90 dark:text-blue-200">
                  {record.originalFilename || record.filename}
                </span>
              </div>
              
              {/* Thumbnail */}
              <div className="mb-4 flex justify-center">
                <img
                  src={`/uploads/${record.filename}`}
                  alt={`Uploaded ${record.originalFilename || record.filename}`}
                  className="max-w-xs max-h-48 object-contain rounded border border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    // Nếu không thể tải ảnh, có thể hiển thị placeholder
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23e5e7eb"/><text x="12" y="12" font-size="8" text-anchor="middle" alignment-baseline="middle" fill="%239ca3af">No Image</text></svg>';
                  }}
                />
              </div>
              
              <PredictionResult
                prediction={record.prediction}
                filename={record.originalFilename || record.filename}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
