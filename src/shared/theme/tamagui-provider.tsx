import React from 'react';
import { TamaguiProvider as TamaguiProviderOriginal, TamaguiProviderProps } from '@tamagui/core';
import config from '../../../tamagui.config';

export function TamaguiProvider({ children, ...props }: Omit<TamaguiProviderProps, 'config'>) {
  return (
    <TamaguiProviderOriginal config={config} {...props}>
      {children}
    </TamaguiProviderOriginal>
  );
}

export default TamaguiProvider;