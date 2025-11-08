import { Prediction } from '../../types';

interface PredictionResultProps {
  prediction: string;
  filename?: string;
  onNewUpload?: () => void;
}

const PredictionResult = ({ prediction, filename, onNewUpload }: PredictionResultProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Prediction Result</h2>
      
      <div className="space-y-4">
        {filename && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">File:</span>
            <span className="ml-2 truncate">{filename}</span>
          </div>
        )}
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                  {prediction.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Diagnosis</h3>
              <p className="text-blue-800 dark:text-blue-200 font-semibold text-lg capitalize">
                {prediction.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">What does this mean?</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {prediction.toLowerCase().includes('melanoma') && (
              <p>This is a potentially serious condition. Please consult with a dermatologist for further evaluation.</p>
            )}
            {prediction.toLowerCase().includes('nevus') && (
              <p>This appears to be a benign mole. However, monitor for any changes and consult a dermatologist if concerned.</p>
            )}
            {prediction.toLowerCase().includes('basal') && (
              <p>This may be basal cell carcinoma, the most common type of skin cancer. Please see a dermatologist.</p>
            )}
            {prediction.toLowerCase().includes('actinic') && (
              <p>This may be actinic keratosis, a precancerous condition. Consult a dermatologist for proper treatment.</p>
            )}
            {!prediction.toLowerCase().includes('melanoma') && 
             !prediction.toLowerCase().includes('nevus') && 
             !prediction.toLowerCase().includes('basal') && 
             !prediction.toLowerCase().includes('actinic') && (
              <p>Consult with a dermatologist for further evaluation of this skin condition.</p>
            )}
          </div>
        </div>
        
        {onNewUpload && (
          <div className="mt-6">
            <button
              onClick={onNewUpload}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Upload Another Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionResult;