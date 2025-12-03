import * as React from 'react';
import { cn } from '../../utils';

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Visual state
   */
  state?: 'default' | 'error';

  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Callback when files are selected
   */
  onFilesChange?: (files: FileList | null) => void;

  /**
   * Additional className for wrapper
   */
  wrapperClassName?: string;
}

/**
 * Upload Icon
 */
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * FileUpload component
 *
 * File input with drag-and-drop support and file validation.
 *
 * @example
 * ```tsx
 * // Basic file upload
 * <FileUpload label="Profile Photo" accept="image/*" />
 *
 * // Multiple files
 * <FileUpload
 *   label="Documents"
 *   multiple
 *   accept=".pdf,.doc,.docx"
 *   helperText="Upload PDF or Word documents"
 * />
 *
 * // With file size limit
 * <FileUpload
 *   label="Avatar"
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   helperText="Maximum file size: 5MB"
 * />
 *
 * // With validation
 * <FileUpload
 *   label="Upload"
 *   state="error"
 *   helperText="File too large"
 * />
 * ```
 */
export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      label,
      helperText,
      state = 'default',
      maxSize,
      onFilesChange,
      wrapperClassName,
      id,
      disabled,
      accept,
      multiple,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    const [isDragOver, setIsDragOver] = React.useState(false);
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        onFilesChange?.(files);
      }
      props.onChange?.(event);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (!disabled && event.dataTransfer.files) {
        const files = event.dataTransfer.files;
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        onFilesChange?.(files);
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              disabled ? 'text-neutral-400' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}

        <label
          htmlFor={inputId}
          className={cn(
            'block w-full rounded-lg border-2 border-dashed px-6 py-8',
            'transition-colors duration-200 cursor-pointer',
            'hover:border-primary-400 hover:bg-primary-50/50',
            // Drag state
            isDragOver && 'border-primary-500 bg-primary-50',
            // State styles
            state === 'default' && 'border-neutral-300',
            state === 'error' && 'border-error-500',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed hover:border-neutral-300 hover:bg-transparent',
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            type="file"
            id={inputId}
            className="sr-only"
            onChange={handleFileChange}
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            aria-invalid={state === 'error' ? 'true' : undefined}
            aria-describedby={helperTextId}
            {...props}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <UploadIcon className={cn('mb-2', isDragOver ? 'text-primary-500' : 'text-neutral-400')} />

            {selectedFiles.length > 0 ? (
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <p key={index} className="text-sm text-neutral-700">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-neutral-700 mb-1">
                  <span className="font-semibold text-primary-500">Click to upload</span> or drag and drop
                </p>
                {accept && (
                  <p className="text-xs text-neutral-500">
                    {accept.split(',').map(type => type.trim()).join(', ')}
                  </p>
                )}
                {maxSize && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Maximum size: {formatFileSize(maxSize)}
                  </p>
                )}
              </>
            )}
          </div>
        </label>

        {helperText && (
          <p
            id={helperTextId}
            className={cn(
              'mt-1.5 text-sm',
              state === 'error' && 'text-error-600',
              state === 'default' && 'text-neutral-600'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
