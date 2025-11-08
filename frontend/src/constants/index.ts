export const SKIN_LESION_CLASSES = {
  MEL: {
    code: 'MEL',
    name: 'Melanoma',
    description: 'A type of skin cancer that develops from melanocytes',
    color: '#ef4444', // red-500
    severity: 'high',
  },
  NV: {
    code: 'NV',
    name: 'Nevus',
    description: 'A benign mole or birthmark',
    color: '#10b981', // emerald-500
    severity: 'low',
  },
  BCC: {
    code: 'BCC',
    name: 'Basal Cell Carcinoma',
    description: 'The most common type of skin cancer',
    color: '#f59e0b', // amber-500
    severity: 'medium',
  },
  AK: {
    code: 'AK',
    name: 'Actinic Keratosis',
    description: 'A rough, scaly patch on sun-exposed skin',
    color: '#f97316', // orange-500
    severity: 'medium',
  },
  BKL: {
    code: 'BKL',
    name: 'Benign Keratosis',
    description: 'A non-cancerous skin growth',
    color: '#84cc16', // lime-500
    severity: 'low',
  },
  DF: {
    code: 'DF',
    name: 'Dermatofibroma',
    description: 'A benign fibrous nodule',
    color: '#06b6d4', // cyan-500
    severity: 'low',
  },
  VASC: {
    code: 'VASC',
    name: 'Vascular Lesion',
    description: 'A lesion involving blood vessels',
    color: '#8b5cf6', // violet-500
    severity: 'low',
  },
  SCC: {
    code: 'SCC',
    name: 'Squamous Cell Carcinoma',
    description: 'A type of skin cancer from squamous cells',
    color: '#dc2626', // red-600
    severity: 'high',
  },
  UNK: {
    code: 'UNK',
    name: 'Unknown',
    description: 'Classification uncertain',
    color: '#6b7280', // gray-500
    severity: 'unknown',
  },
} as const;

export const QC_THRESHOLDS = {
  brightness: {
    min: 10,
    max: 245,
    optimal: { min: 50, max: 200 },
  },
  contrast: {
    min: 0.1,
    optimal: { min: 0.3, max: 1.0 },
  },
  blur: {
    max: 100,
    optimal: { min: 200 },
  },
} as const;

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    profile: '/api/v1/auth/profile',
  },
  cases: {
    list: '/api/v1/cases',
    create: '/api/v1/cases',
    detail: (id: string) => `/api/v1/cases/${id}`,
    update: (id: string) => `/api/v1/cases/${id}`,
    delete: (id: string) => `/api/v1/cases/${id}`,
  },
  images: {
    upload: '/api/v1/images/upload',
    detail: (id: string) => `/api/v1/images/${id}`,
    qc: (id: string) => `/api/v1/images/${id}/qc`,
    delete: (id: string) => `/api/v1/images/${id}`,
 },
  predictions: {
    create: '/api/v1/predictions',
    job: (id: string) => `/api/v1/predictions/jobs/${id}`,
    result: (id: string) => `/api/v1/predictions/${id}`,
    heatmap: (id: string) => `/api/v1/predictions/${id}/heatmap`,
  },
  ml: {
    upload: '/api/v1/ml/upload',
    predict: '/api/v1/ml/predict',
    predictFromUpload: (filename: string) => `/api/v1/ml/predict-from-upload/${filename}`,
    history: '/api/v1/ml/predictions/history',
  },
  models: {
    list: '/api/v1/models',
    active: '/api/v1/models/active',
    info: (id: string) => `/api/v1/models/${id}`,
 },
  logs: {
    list: '/api/v1/logs',
    export: '/api/v1/logs/export',
  },
} as const;

export const QUERY_KEYS = {
  auth: ['auth'] as const,
  cases: ['cases'] as const,
  case: (id: string) => ['cases', id] as const,
  images: ['images'] as const,
  image: (id: string) => ['images', id] as const,
  predictions: ['predictions'] as const,
  prediction: (id: string) => ['predictions', id] as const,
  predictionJob: (id: string) => ['predictions', 'jobs', id] as const,
  models: ['models'] as const,
  logs: ['logs'] as const,
} as const;

export const STORAGE_KEYS = {
  theme: 'skin-dx-theme',
  auth: 'skin-dx-auth',
  uploadDraft: 'skin-dx-upload-draft',
} as const;

export const ROUTES = {
  login: '/login',
  upload: '/upload',
  results: '/results',
  case: (id: string) => `/cases/${id}`,
  cases: '/cases',
  adminLogs: '/admin/logs',
} as const;
