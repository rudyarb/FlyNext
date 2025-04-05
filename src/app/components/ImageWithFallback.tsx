import { useState, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = ''
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (!src) {
    console.log('ImageWithFallback: No src provided');
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
        <FaImage className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={() => {
        console.log('Image loaded successfully:', src);
        setIsLoading(false);
      }}
      onError={(e) => {
        console.error('Image load error:', {
          src,
          error: e.currentTarget.error
        });
        setHasError(true);
        setIsLoading(false);
      }}
    />
  );
}