export type InputImageUploadSize = 'sm' | 'md' | 'lg';

export type InputImageUploadValueType = 'file' | 'data-url';

export type InputImageUploadValue = File[] | string[];

export interface InputImageUploadConfig {
  valueType?: InputImageUploadValueType;
  multiple?: boolean;
  allowedTypes?: string[];
  maxFileSizeBytes?: number;
  maxDataUrlLength?: number;
}
