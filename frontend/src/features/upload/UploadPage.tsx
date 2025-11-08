import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ImageFile, UploadFormData, PredictionJob } from '../../types';
import { apiClient } from '../../lib/api';
import { API_ENDPOINTS } from '../../constants';
import UploadArea from './UploadArea';
import toast from 'react-hot-toast';
import { mlApi } from '../../lib/ml-api';
import PredictionResult from './PredictionResult';

const schema = yup.object({
  patientName: yup.string(),
  patientAge: yup.number().positive().integer(),
  patientGender: yup.string().oneOf(['male', 'female', 'other']),
  notes: yup.string(),
});

type PatientFormData = yup.InferType<typeof schema>;

const UploadPage = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [predictionResults, setPredictionResults] = useState<Array<{prediction: string, filename: string, originalFile?: File}>>([]);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: yupResolver(schema),
  });

  const { mutate: startPrediction, isLoading } = useMutation(
    async (data: { caseData: PatientFormData, imageIds: string[] }): Promise<PredictionJob> => {
      const response = await apiClient.post(API_ENDPOINTS.predictions.create, data);
      return response as PredictionJob;
    },
    {
      onSuccess: (job) => {
        toast.success('Analysis started! Redirecting to results...');
        navigate(`/results/${job.id}`);
      },
      onError: () => {
        toast.error('Failed to start analysis. Please try again.');
      },
    }
  );

  const handleFilesChange = (newFiles: ImageFile[]) => {
    setFiles(newFiles);
  };

  const onSubmit = async (data: PatientFormData) => {
    if (files.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    // Process the first file (for simplicity)
    const file = files[0];
    try {
      // Upload the file
      const uploadResult = await mlApi.uploadImage(file.file);
      toast.success(`Successfully uploaded: ${file.file.name}`);
      
      // Then predict using the uploaded file
      const predictResult = await mlApi.predictImage(file.file);
      console.log('Prediction result:', predictResult); // Debug log
      
      // Thêm kết quả vào danh sách
      setPredictionResults(prev => [...prev, {
        prediction: predictResult.prediction,
        filename: predictResult.filename,
        originalFile: file.file
      }]);
      toast.success(`Prediction result for ${file.file.name}: ${predictResult.prediction}`);
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to process ${file.file.name}. Error: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Skin Lesion Images
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Patient Information Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Patient Information (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient Name
                </label>
                <input
                  {...register('patientName')}
                  type="text"
                  id="patientName"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient Age
                </label>
                <input
                  {...register('patientAge')}
                  type="number"
                  id="patientAge"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.patientAge && <p className="mt-1 text-sm text-red-500">{errors.patientAge.message}</p>}
              </div>
              <div>
                <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient Gender
                </label>
                <select
                  {...register('patientGender')}
                  id="patientGender"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Images
            </h2>
            <UploadArea files={files} onFilesChange={handleFilesChange} disabled={isLoading} />
          </div>

          {/* Submission Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || files.length === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Analysis...
                </div>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Prediction Results List */}
      {predictionResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prediction Results</h2>
          {predictionResults.map((result, index) => (
            <PredictionResult
              key={index}
              prediction={result.prediction}
              filename={result.filename}
              onNewUpload={() => setPredictionResults([])} // Clear all results to allow new upload
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
