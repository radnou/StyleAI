import { Result } from '../types';

export interface UploadFileRequest {
  uri: string;
  path: string;
  metadata?: Record<string, any>;
}

export interface UploadFileResponse {
  url: string;
  path: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}

export interface DownloadFileRequest {
  path: string;
}

export interface DownloadFileResponse {
  uri: string;
  size: number;
  contentType: string;
}

export interface DeleteFileRequest {
  path: string;
}

export interface ListFilesRequest {
  path: string;
  maxResults?: number;
  pageToken?: string;
}

export interface ListFilesResponse {
  files: FileInfo[];
  nextPageToken?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  contentType: string;
  created: Date;
  updated: Date;
  metadata?: Record<string, any>;
}

export interface IStorageService {
  /**
   * Upload a file to storage
   */
  uploadFile(uri: string, path: string, metadata?: Record<string, any>): Promise<Result<UploadFileResponse>>;

  /**
   * Download a file from storage
   */
  downloadFile(path: string): Promise<Result<DownloadFileResponse>>;

  /**
   * Delete a file from storage
   */
  deleteFile(path: string): Promise<Result<void>>;

  /**
   * List files in a directory
   */
  listFiles(path: string, maxResults?: number, pageToken?: string): Promise<Result<ListFilesResponse>>;

  /**
   * Get file metadata
   */
  getFileMetadata(path: string): Promise<Result<FileInfo>>;

  /**
   * Check if file exists
   */
  fileExists(path: string): Promise<Result<boolean>>;

  /**
   * Get file download URL
   */
  getDownloadUrl(path: string): Promise<Result<string>>;

  /**
   * Copy file to another location
   */
  copyFile(sourcePath: string, destinationPath: string): Promise<Result<void>>;

  /**
   * Move file to another location
   */
  moveFile(sourcePath: string, destinationPath: string): Promise<Result<void>>;

  /**
   * Get storage usage statistics
   */
  getUsageStats(): Promise<Result<StorageUsageStats>>;
}

export interface StorageUsageStats {
  totalSize: number;
  fileCount: number;
  folders: FolderStats[];
}

export interface FolderStats {
  path: string;
  size: number;
  fileCount: number;
}