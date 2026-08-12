import { useEffect, useRef, useState } from 'react';
import { decode } from 'blurhash';

interface Props {
  src:       string | null;
  blurhash:  string | null;
  alt?:      string;
  size:      number;          // renders as a square; caller applies rounding via className
  className?: string;
  fallback:  React.ReactNode; // initials element shown when no src
}

export default function BlurhashImg({ src, blurhash, alt = '', size, className = '', fallback }: Props) {
  const canvasRef              = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setLoaded] = useState(false);

  // Decode the blurhash into the canvas once — only when the hash changes.
  useEffect(() => {
    if (!blurhash || !canvasRef.current) return;
    try {
      const pixels = decode(blurhash, size, size);
      const ctx    = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.createImageData(size, size);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      // malformed hash — canvas stays blank, real image shows when loaded
    }
  }, [blurhash, size]);

  // Reset loaded state whenever the src changes (e.g. list scroll reuse).
  useEffect(() => { setLoaded(false); }, [src]);

  if (!src) return <>{fallback}</>;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {/* Blurhash canvas — underneath, fades out when the real image loads */}
      {blurhash && (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: imgLoaded ? 0 : 1, transition: 'opacity 0.3s ease' }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}
