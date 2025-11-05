import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Case, CaseListParams, ApiResponse, PaginatedResponse } from '../../types';
import { apiClient } from '../../lib/api';
import { API_ENDPOINTS, QUERY_KEYS } from '../../constants';
import { formatDate, formatRelativeTime } from '../../utils';
import ImageCard from '../results/ImageCard';
import CaseFusionPanel from './CaseFusionPanel';

const PatientView = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Case['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'patientName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Query for case list
  const { data: casesData, isLoading: casesLoading } = useQuery<PaginatedResponse<Case>>({
    queryKey: ['cases', searchTerm, statusFilter, sortBy, sortOrder, currentPage],
    queryFn: async () => {
      const params: CaseListParams = {
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortOrder,
      };
      return apiClient.get<PaginatedResponse<Case>>(API_ENDPOINTS.cases.list, { params });
    },
  });

  // Query for specific case if caseId is provided
  const { data: selectedCase, isLoading: caseLoading } = useQuery({
    queryKey: QUERY_KEYS.case(caseId || ''),
    queryFn: () => apiClient.get<Case>(API_ENDPOINTS.cases.detail(caseId || '')),
    enabled: !!caseId,
  });

  const handleCaseClick = (case_: Case) => {
    navigate(`/cases/${case_.id}`);
  };

  const handleViewResults = (case_: Case) => {
    navigate(`/results/${case_.id}`);
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (caseId && selectedCase) {
    // Show detailed case view
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/cases')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back to Cases
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCase.patientName || `Case ${selectedCase.id.slice(0, 8)}`}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {formatDate(selectedCase.createdAt)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <PhotoIcon className="h-4 w-4" />
                    <span>{selectedCase.images.length} images</span>
                  </span>
                  {selectedCase.patientAge && (
                    <span className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{selectedCase.patientAge} years old</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCase.status)}`}>
                {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
              </span>
              <button
                onClick={() => handleViewResults(selectedCase)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Results
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Images ({selectedCase.images.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCase.images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    prediction={image.prediction}
                    showQC={true}
                    showPrediction={true}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Case Analysis */}
          <div className="space-y-6">
            <CaseFusionPanel caseData={selectedCase} />

            {/* Case Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Case Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Case ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{selectedCase.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(selectedCase.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(selectedCase.updatedAt)}</span>
                </div>
                {selectedCase.patientGender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{selectedCase.patientGender}</span>
                  </div>
                )}
                {selectedCase.notes && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">Notes:</span>
                    <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selectedCase.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show case list view
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Case Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and review skin lesion diagnosis cases
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="patientName">Patient Name</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {casesLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))
        ) : casesData?.data?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No cases found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first case.'}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First Case
            </button>
          </div>
        ) : (
          casesData?.data?.map((case_: Case) => (
            <div
              key={case_.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCaseClick(case_)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {case_.patientName || `Case ${case_.id.slice(0, 8)}`}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </span>
                      {case_.patientAge && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {case_.patientAge}y
                        </span>
                      )}
                      {case_.patientGender && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {case_.patientGender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Images:</span>
                    <span className="font-medium">{case_.images.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span>{formatRelativeTime(case_.createdAt)}</span>
                  </div>
                  {case_.fusedPrediction && (
                    <div className="flex items-center justify-between">
                      <span>Top prediction:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {case_.fusedPrediction.predictions[0]?.className}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResults(case_);
                    }}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Results
                  </button>

                  {case_.notes && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                      {case_.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {casesData && casesData.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, casesData.total)} of {casesData.total} cases
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {casesData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(casesData.totalPages, currentPage + 1))}
                disabled={currentPage === casesData.totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
