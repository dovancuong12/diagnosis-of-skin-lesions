import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { AuditLog, LogsParams, PaginatedResponse } from '../types';
import { apiClient } from '../lib/api';
import { API_ENDPOINTS, QUERY_KEYS } from '../constants';
import { formatDate, formatRelativeTime, downloadAsJson } from '../utils';

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 50;

  // Query for audit logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.logs.concat([
      searchTerm, actionFilter, resourceFilter, userFilter,
      dateRange.start, dateRange.end, currentPage
    ]),
    queryFn: () => {
      const params: LogsParams = {
        page: currentPage,
        pageSize,
        action: actionFilter === 'all' ? undefined : actionFilter,
        resource: resourceFilter === 'all' ? undefined : resourceFilter,
        userId: userFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      };
      return apiClient.get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.logs.list, { params });
    },
  });

  const handleExport = async () => {
    try {
      const params: LogsParams = {
        action: actionFilter === 'all' ? undefined : actionFilter,
        resource: resourceFilter === 'all' ? undefined : resourceFilter,
        userId: userFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      };

      const data = await apiClient.get(API_ENDPOINTS.logs.export, { params });
      downloadAsJson(data, `audit-logs-${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'update':
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'login':
        return <UserIcon className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserIcon className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'text-green-600 dark:text-green-400';
      case 'update':
        return 'text-blue-600 dark:text-blue-400';
      case 'delete':
        return 'text-red-600 dark:text-red-400';
      case 'login':
        return 'text-green-600 dark:text-green-400';
      case 'logout':
        return 'text-gray-600 dark:text-gray-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const uniqueActions = Array.from(
    new Set(logsData?.data?.map(log => log.action) || [])
  );

  const uniqueResources = Array.from(
    new Set(logsData?.data?.map(log => log.resource) || [])
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor system activities and user actions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Resources</option>
            {uniqueResources.map(resource => (
              <option key={resource} value={resource}>{resource}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="User email..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
          </div>
        ) : logsData?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No logs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No audit logs match your current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logsData?.data?.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div>{formatDate(log.timestamp)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(log.timestamp)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.userEmail}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {log.userId.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className={`font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.resource}</div>
                            {log.resourceId && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {log.resourceId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {log.details ? (
                          <div className="max-w-xs truncate">
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(log.details)
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400">No details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsData && logsData.totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, logsData.total)} of {logsData.total} logs
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
                      Page {currentPage} of {logsData.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(logsData.totalPages, currentPage + 1))}
                      disabled={currentPage === logsData.totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Timestamp
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedLog.timestamp)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getActionIcon(selectedLog.action)}
                      <span className={`text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      User
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedLog.userEmail}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      ID: {selectedLog.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resource
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedLog.resource}
                    </p>
                    {selectedLog.resourceId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        ID: {selectedLog.resourceId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      IP Address
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      User Agent
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                </div>

                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Details
                    </label>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm text-gray-900 dark:text-white overflow-x-auto">
                      {typeof selectedLog.details === 'string'
                        ? selectedLog.details
                        : JSON.stringify(selectedLog.details, null, 2)
                      }
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
