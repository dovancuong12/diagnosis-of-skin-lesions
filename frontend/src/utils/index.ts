import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SKIN_LESION_CLASSES, QC_THRESHOLDS, UPLOAD_CONFIG } from '../constants';
import { QualityControlResults, SkinLesionClass } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFileType(file: File): boolean {
  return UPLOAD_CONFIG.acceptedTypes.includes(file.type);
}

export function validateFileSize(file: File): boolean {
  return file.size <= UPLOAD_CONFIG.maxFileSize;
}

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getClassInfo(classCode: SkinLesionClass) {
  return SKIN_LESION_CLASSES[classCode];
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
  if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function evaluateImageQuality(
  brightness: number,
  contrast: number,
  blur: number
): QualityControlResults {
  const warnings: string[] = [];
  let isAcceptable = true;

  // Check brightness
  if (brightness < QC_THRESHOLDS.brightness.min) {
    warnings.push('Image is too dark');
    isAcceptable = false;
  } else if (brightness > QC_THRESHOLDS.brightness.max) {
    warnings.push('Image is too bright');
    isAcceptable = false;
  } else if (
    brightness < QC_THRESHOLDS.brightness.optimal.min ||
    brightness > QC_THRESHOLDS.brightness.optimal.max
  ) {
    warnings.push('Brightness could be improved');
  }

  // Check contrast
  if (contrast < QC_THRESHOLDS.contrast.min) {
    warnings.push('Image has low contrast');
    isAcceptable = false;
  } else if (contrast < QC_THRESHOLDS.contrast.optimal.min) {
    warnings.push('Contrast could be improved');
  }

  // Check blur
  if (blur > QC_THRESHOLDS.blur.max) {
    warnings.push('Image is too blurry');
    isAcceptable = false;
  } else if (blur < QC_THRESHOLDS.blur.optimal.min) {
    warnings.push('Image could be sharper');
  }

  return {
    brightness,
    contrast,
    blur,
    isAcceptable,
    warnings,
  };
}

export function getQCStatusColor(qc: QualityControlResults): string {
  if (!qc.isAcceptable) return 'text-red-600 dark:text-red-400';
  if (qc.warnings.length > 0) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export function getQCStatusLabel(qc: QualityControlResults): string {
  if (!qc.isAcceptable) return 'Poor';
  if (qc.warnings.length > 0) return 'Fair';
  return 'Good';
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(d);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function downloadAsJson(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}
