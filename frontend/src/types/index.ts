export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  qcResults?: QualityControlResults;
  prediction?: Prediction;
}

export interface QualityControlResults {
  brightness: number;
  contrast: number;
  blur: number;
  isAcceptable: boolean;
  warnings: string[];
}

export interface Prediction {
  id: string;
  imageId: string;
  predictions: ClassPrediction[];
  confidence: number;
  heatmapUrl?: string;
  createdAt: string;
}

export interface ClassPrediction {
  className: SkinLesionClass;
  confidence: number;
  description: string;
}

export type SkinLesionClass = 
  | 'MEL'  // Melanoma
  | 'NV'   // Nevus
  | 'BCC'  // Basal Cell Carcinoma
  | 'AK'   // Actinic Keratosis
  | 'BKL'  // Benign Keratosis
  | 'DF'   // Dermatofibroma
  | 'VASC' // Vascular Lesion
  | 'SCC'  // Squamous Cell Carcinoma
  | 'UNK'; // Unknown

export interface Case {
  id: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  images: CaseImage[];
  fusedPrediction?: Prediction;
  status: 'draft' | 'processing' | 'completed' | 'reviewed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CaseImage {
  id: string;
  caseId: string;
  imageUrl: string;
  thumbnailUrl: string;
  filename: string;
  qcResults: QualityControlResults;
  prediction?: Prediction;
  uploadedAt: string;
}

export interface PredictionJob {
  id: string;
  caseId: string;
  imageIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: Prediction[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Form types
export interface UploadFormData {
  files: File[];
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  notes?: string;
}

export interface CaseFormData {
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  notes?: string;
}

// Query parameters
export interface CaseListParams {
  page?: number;
  pageSize?: number;
  status?: Case['status'];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'patientName';
  sortOrder?: 'asc' | 'desc';
}

export interface LogsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}
