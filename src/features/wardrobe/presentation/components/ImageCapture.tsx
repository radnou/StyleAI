import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { Button, Sheet, XStack, YStack, Text, Image } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { CameraGalleryService, ImageResult } from '../../infrastructure/services/CameraGalleryService';

export interface ImageCaptureProps {
  onImageSelected: (imageResult: ImageResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  quality?: number;
  allowsEditing?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  children?: React.ReactNode;
}

export interface ImageCaptureState {
  hasPermissions: boolean;
  checkingPermissions: boolean;
  showSheet: boolean;
  processing: boolean;
  selectedImage: ImageResult | null;
}

export function ImageCapture({
  onImageSelected,
  onError,
  disabled = false,
  quality = 0.8,
  allowsEditing = true,
  maxWidth = 1024,
  maxHeight = 1024,
  children,
}: ImageCaptureProps) {
  const [state, setState] = useState<ImageCaptureState>({
    hasPermissions: false,
    checkingPermissions: false,
    showSheet: false,
    processing: false,
    selectedImage: null,
  });

  const cameraService = new CameraGalleryService();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setState(prev => ({ ...prev, checkingPermissions: true }));

    try {
      const permissionResult = await cameraService.getPermissionStatus();
      
      if (permissionResult.succeeded) {
        const hasAllPermissions = permissionResult.value.camera && permissionResult.value.cameraRoll;
        setState(prev => ({ 
          ...prev, 
          hasPermissions: hasAllPermissions,
          checkingPermissions: false 
        }));
      } else {
        setState(prev => ({ ...prev, checkingPermissions: false }));
        onError?.(permissionResult.message);
      }
    } catch (error) {
      setState(prev => ({ ...prev, checkingPermissions: false }));
      onError?.(error instanceof Error ? error.message : 'Permission check failed');
    }
  };

  const requestPermissions = async () => {
    setState(prev => ({ ...prev, checkingPermissions: true }));

    try {
      const permissionResult = await cameraService.requestPermissions();
      
      if (permissionResult.succeeded) {
        const hasAllPermissions = permissionResult.value.camera && permissionResult.value.cameraRoll;
        setState(prev => ({ 
          ...prev, 
          hasPermissions: hasAllPermissions,
          checkingPermissions: false 
        }));

        if (!hasAllPermissions) {
          Alert.alert(
            'Permissions Required',
            'Camera and photo library access are required to capture and select images.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    // iOS doesn't have a direct way to open settings
                    Alert.alert('Please enable permissions in Settings');
                  }
                }
              },
            ]
          );
        }
      } else {
        setState(prev => ({ ...prev, checkingPermissions: false }));
        onError?.(permissionResult.message);
      }
    } catch (error) {
      setState(prev => ({ ...prev, checkingPermissions: false }));
      onError?.(error instanceof Error ? error.message : 'Permission request failed');
    }
  };

  const openImagePicker = () => {
    if (!state.hasPermissions) {
      requestPermissions();
      return;
    }

    setState(prev => ({ ...prev, showSheet: true }));
  };

  const captureFromCamera = async () => {
    setState(prev => ({ ...prev, showSheet: false, processing: true }));

    try {
      const options = {
        quality,
        allowsEditing,
        mediaTypes: 'Images' as const,
      };

      const result = await cameraService.captureImage(options);
      
      if (result.succeeded) {
        setState(prev => ({ ...prev, selectedImage: result.value, processing: false }));
        onImageSelected(result.value);
      } else {
        setState(prev => ({ ...prev, processing: false }));
        onError?.(result.message);
      }
    } catch (error) {
      setState(prev => ({ ...prev, processing: false }));
      onError?.(error instanceof Error ? error.message : 'Camera capture failed');
    }
  };

  const selectFromGallery = async () => {
    setState(prev => ({ ...prev, showSheet: false, processing: true }));

    try {
      const options = {
        quality,
        allowsEditing,
        mediaTypes: 'Images' as const,
        allowsMultipleSelection: false,
      };

      const result = await cameraService.selectFromGallery(options);
      
      if (result.succeeded) {
        const imageResult = Array.isArray(result.value) ? result.value[0] : result.value;
        setState(prev => ({ ...prev, selectedImage: imageResult, processing: false }));
        onImageSelected(imageResult);
      } else {
        setState(prev => ({ ...prev, processing: false }));
        onError?.(result.message);
      }
    } catch (error) {
      setState(prev => ({ ...prev, processing: false }));
      onError?.(error instanceof Error ? error.message : 'Gallery selection failed');
    }
  };

  const closeSheet = () => {
    setState(prev => ({ ...prev, showSheet: false }));
  };

  if (children) {
    return (
      <>
        <div onClick={openImagePicker} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {children}
        </div>
        <ImagePickerSheet
          open={state.showSheet}
          onOpenChange={closeSheet}
          onCameraPress={captureFromCamera}
          onGalleryPress={selectFromGallery}
          processing={state.processing}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onPress={openImagePicker}
        disabled={disabled || state.processing}
        icon={<Ionicons name="image" size={20} />}
        loading={state.processing || state.checkingPermissions}
      >
        {state.processing ? 'Processing...' : 'Select Image'}
      </Button>

      <ImagePickerSheet
        open={state.showSheet}
        onOpenChange={closeSheet}
        onCameraPress={captureFromCamera}
        onGalleryPress={selectFromGallery}
        processing={state.processing}
      />

      {state.selectedImage && (
        <YStack marginTop="$4" space="$2">
          <Text fontSize="$3" color="$gray11">
            Selected Image:
          </Text>
          <Image
            source={{ uri: state.selectedImage.uri }}
            width={200}
            height={200}
            resizeMode="cover"
            borderRadius="$4"
          />
          <Text fontSize="$2" color="$gray10">
            {state.selectedImage.width} × {state.selectedImage.height}
            {state.selectedImage.fileSize && ` • ${Math.round(state.selectedImage.fileSize / 1024)}KB`}
          </Text>
        </YStack>
      )}
    </>
  );
}

interface ImagePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  processing: boolean;
}

function ImagePickerSheet({
  open,
  onOpenChange,
  onCameraPress,
  onGalleryPress,
  processing,
}: ImagePickerSheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" space="$4">
        <YStack space="$4">
          <Text fontSize="$5" fontWeight="600" textAlign="center">
            Select Image Source
          </Text>
          
          <XStack space="$4" justifyContent="center">
            <Button
              flex={1}
              onPress={onCameraPress}
              disabled={processing}
              icon={<Ionicons name="camera" size={20} />}
              size="$5"
            >
              Camera
            </Button>
            
            <Button
              flex={1}
              onPress={onGalleryPress}
              disabled={processing}
              icon={<Ionicons name="cloud-upload" size={20} />}
              size="$5"
            >
              Gallery
            </Button>
          </XStack>
          
          <Button
            onPress={() => onOpenChange(false)}
            variant="outlined"
            disabled={processing}
          >
            Cancel
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

export default ImageCapture;