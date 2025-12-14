'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  showSkeleton?: boolean;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/10]',
  auto: '',
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  aspectRatio = 'auto',
  showSkeleton = true,
  className,
  fill,
  width,
  height,
  priority,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const imageSrc = hasError ? fallbackSrc : src;

  // For fill mode, we need a container with position relative
  if (fill) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {showSkeleton && isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
          sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          {...props}
        />
      </div>
    );
  }

  // For fixed dimensions
  return (
    <div
      className={cn(
        'relative overflow-hidden inline-block',
        aspectRatioClasses[aspectRatio],
        className
      )}
      style={
        aspectRatio === 'auto' && width && height
          ? { width, height }
          : undefined
      }
    >
      {showSkeleton && isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={width && height ? { width, height } : undefined}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
