import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Cấu hình mặc định cho các query
const defaultQueryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Không tự động refetch khi focus lại trình duyệt
    retry: 1, // Thử lại 1 lần khi có lỗi
    staleTime: 5 * 60 * 1000, // 5 phút trước khi dữ liệu được coi là cũ
    cacheTime: 10 * 60 * 1000, // 10 phút trước khi xóa khỏi bộ nhớ đệm
    refetchOnMount: true, // Tự động refetch khi component mount
    refetchOnReconnect: true, // Tự động refetch khi mất kết nối mạng
  },
  mutations: {
    retry: 1, // Thử lại 1 lần khi mutation thất bại
  },
};

// Khởi tạo QueryClient với cấu hình
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryConfig,
});

// Tạo persister để lưu trữ cache vào localStorage
export const persister = createSyncStoragePersister({
  key: 'REACT_QUERY_OFFLINE_CACHE',
  storage: window.localStorage,
  throttleTime: 1000, // Giới hạn tần suất lưu vào localStorage
});

// Hàm để xóa cache cũ khi cần thiết
export const clearPersistedCache = async () => {
  await persister.removeClient();
  await queryClient.clear();
};

