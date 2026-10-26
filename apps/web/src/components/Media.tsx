import React, { useState } from 'react';

interface MediaProps {
  src?: string | null;
  alt?: string;
  label?: string;
  colorStart?: string;
  colorEnd?: string;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
  isVideo?: boolean;
}

export const Media: React.FC<MediaProps> = ({
  src,
  alt = 'Pahadi craft media',
  label,
  colorStart = '#D8C9B3',
  colorEnd = '#74765B',
  aspectRatio,
  className = '',
  style = {},
  isVideo = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerStyle: React.CSSProperties = {
    ...style,
    ['--c1' as any]: colorStart,
    ['--c2' as any]: colorEnd,
    ...(aspectRatio ? { aspectRatio } : {}),
  };

  const showFallback = !src || hasError;

  return (
    <div className={`media-box ${className}`} style={containerStyle}>
      {src && !hasError && (
        isVideo ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHasError(true)}
            onLoadedData={() => setIsLoaded(true)}
            style={{ opacity: isLoaded ? 1 : 0 }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            style={{ opacity: isLoaded ? 1 : 0 }}
          />
        )
      )}
      {(showFallback || label) && (
        <span className="media-label">{label || (showFallback ? alt : '')}</span>
      )}
    </div>
  );
};
