import storage from '@react-native-firebase/storage';
import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { 
  IStorageService, 
  UploadFileResponse, 
  DownloadFileResponse, 
  ListFilesResponse, 
  FileInfo, 
  StorageUsageStats 
} from '../../../../core/services/IStorageService';

export class FirebaseStorageService implements IStorageService {
  private readonly bucketName: string;

  constructor(bucketName?: string) {
    this.bucketName = bucketName || storage().app.options.storageBucket || 'default';
  }

  async uploadFile(
    uri: string, 
    path: string, 
    metadata?: Record<string, any>
  ): Promise<Result<UploadFileResponse>> {
    try {
      const reference = storage().ref(path);
      
      // Set custom metadata if provided
      const customMetadata = {
        uploadedAt: new Date().toISOString(),
        ...metadata,
      };

      // Upload file
      const task = reference.putFile(uri, {
        customMetadata,
      });

      // Wait for upload to complete
      await task;

      // Get download URL
      const downloadURL = await reference.getDownloadURL();

      // Get file metadata
      const fileMetadata = await reference.getMetadata();

      const response: UploadFileResponse = {
        url: downloadURL,
        path,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType || 'application/octet-stream',
        metadata: fileMetadata.customMetadata,
      };

      return Result.ok<UploadFileResponse>(response);
    } catch (error) {
      return Result.fail<UploadFileResponse>(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async downloadFile(path: string): Promise<Result<DownloadFileResponse>> {
    try {
      const reference = storage().ref(path);
      
      // Get download URL
      const downloadURL = await reference.getDownloadURL();
      
      // Get file metadata
      const metadata = await reference.getMetadata();

      const response: DownloadFileResponse = {
        uri: downloadURL,
        size: metadata.size,
        contentType: metadata.contentType || 'application/octet-stream',
      };

      return Result.ok<DownloadFileResponse>(response);
    } catch (error) {
      return Result.fail<DownloadFileResponse>(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteFile(path: string): Promise<Result<void>> {
    try {
      const reference = storage().ref(path);
      await reference.delete();
      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async listFiles(
    path: string, 
    maxResults?: number, 
    pageToken?: string
  ): Promise<Result<ListFilesResponse>> {
    try {
      const reference = storage().ref(path);
      
      const options: any = {
        maxResults: maxResults || 100,
      };
      
      if (pageToken) {
        options.pageToken = pageToken;
      }

      const listResult = await reference.list(options);

      const files: FileInfo[] = await Promise.all(
        listResult.items.map(async (item) => {
          const metadata = await item.getMetadata();
          return {
            name: item.name,
            path: item.fullPath,
            size: metadata.size,
            contentType: metadata.contentType || 'application/octet-stream',
            created: new Date(metadata.timeCreated),
            updated: new Date(metadata.updated),
            metadata: metadata.customMetadata,
          };
        })
      );

      const response: ListFilesResponse = {
        files,
        nextPageToken: listResult.nextPageToken,
      };

      return Result.ok<ListFilesResponse>(response);
    } catch (error) {
      return Result.fail<ListFilesResponse>(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getFileMetadata(path: string): Promise<Result<FileInfo>> {
    try {
      const reference = storage().ref(path);
      const metadata = await reference.getMetadata();

      const fileInfo: FileInfo = {
        name: reference.name,
        path: reference.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || 'application/octet-stream',
        created: new Date(metadata.timeCreated),
        updated: new Date(metadata.updated),
        metadata: metadata.customMetadata,
      };

      return Result.ok<FileInfo>(fileInfo);
    } catch (error) {
      return Result.fail<FileInfo>(
        `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async fileExists(path: string): Promise<Result<boolean>> {
    try {
      const reference = storage().ref(path);
      await reference.getMetadata();
      return Result.ok<boolean>(true);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return Result.ok<boolean>(false);
      }
      return Result.fail<boolean>(
        `Failed to check file existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getDownloadUrl(path: string): Promise<Result<string>> {
    try {
      const reference = storage().ref(path);
      const downloadURL = await reference.getDownloadURL();
      return Result.ok<string>(downloadURL);
    } catch (error) {
      return Result.fail<string>(
        `Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<Result<void>> {
    try {
      // Firebase Storage doesn't have a direct copy method
      // We need to download and re-upload
      const downloadResult = await this.downloadFile(sourcePath);
      if (!downloadResult.succeeded) {
        return Result.fail<void>(`Failed to download source file: ${downloadResult.message}`);
      }

      const uploadResult = await this.uploadFile(downloadResult.value.uri, destinationPath);
      if (!uploadResult.succeeded) {
        return Result.fail<void>(`Failed to upload copied file: ${uploadResult.message}`);
      }

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        `Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<Result<void>> {
    try {
      // Copy file first
      const copyResult = await this.copyFile(sourcePath, destinationPath);
      if (!copyResult.succeeded) {
        return Result.fail<void>(`Failed to copy file: ${copyResult.message}`);
      }

      // Delete original file
      const deleteResult = await this.deleteFile(sourcePath);
      if (!deleteResult.succeeded) {
        // If delete fails, try to delete the copied file to maintain consistency
        await this.deleteFile(destinationPath);
        return Result.fail<void>(`Failed to delete source file: ${deleteResult.message}`);
      }

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        `Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getUsageStats(): Promise<Result<StorageUsageStats>> {
    try {
      // Firebase Storage doesn't provide usage stats directly
      // This would need to be implemented with custom logic or cloud functions
      const stats: StorageUsageStats = {
        totalSize: 0,
        fileCount: 0,
        folders: [],
      };

      return Result.ok<StorageUsageStats>(stats);
    } catch (error) {
      return Result.fail<StorageUsageStats>(
        `Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export class FirebaseStorageError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export class FileNotFoundError extends FirebaseStorageError {
  constructor(path: string) {
    super(`File not found: ${path}`, 'FILE_NOT_FOUND');
  }
}

export class UploadFailedError extends FirebaseStorageError {
  constructor(message: string) {
    super(`Upload failed: ${message}`, 'UPLOAD_FAILED');
  }
}

export class DownloadFailedError extends FirebaseStorageError {
  constructor(message: string) {
    super(`Download failed: ${message}`, 'DOWNLOAD_FAILED');
  }
}

export class InsufficientPermissionsError extends FirebaseStorageError {
  constructor() {
    super('Insufficient permissions for storage operation', 'INSUFFICIENT_PERMISSIONS');
  }
}