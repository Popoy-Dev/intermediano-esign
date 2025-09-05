'use client';

import { useRef, useEffect, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string) => void;
}

export default function SignaturePad({ onSignatureComplete }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for crisp drawing on high-DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size with proper scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    
    // Scale the context to match device pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Set canvas CSS size to match the bounding rect
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Set drawing styles for better responsiveness
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;

    // Reset confirmation state when canvas is cleared
    setIsConfirmed(false);

    const getPoint = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      // Reset confirmation state when user starts drawing again
      setIsConfirmed(false);
      
      const point = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      
      e.preventDefault();
      const point = getPoint(e);
      
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

      const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Don't auto-complete signature here - let user manually confirm
    }
  };

    // Mouse events with passive: false for better control
    canvas.addEventListener('mousedown', startDrawing, { passive: false });
    canvas.addEventListener('mousemove', draw, { passive: false });
    canvas.addEventListener('mouseup', stopDrawing, { passive: false });
    canvas.addEventListener('mouseout', stopDrawing, { passive: false });

    // Touch events with passive: false to prevent scrolling
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    // Handle window resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', handleResize);
    };
  }, [onSignatureComplete]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsConfirmed(false);
    onSignatureComplete('');
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if there's any drawing on the canvas by looking for non-white pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let hasContent = false;
    
    // Check for any non-white pixels (more reliable than alpha channel)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      // If pixel is not white (255, 255, 255), we have content
      if (r !== 255 || g !== 255 || b !== 255) {
        hasContent = true;
        break;
      }
    }
    
    if (hasContent) {
      setIsConfirmed(true);
      onSignatureComplete(canvas.toDataURL());
      console.log('Signature confirmed and saved');
    } else {
      alert('Please draw a signature before confirming.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <canvas
          ref={canvasRef}
          className="w-full h-48 cursor-crosshair bg-white rounded-lg block"
          style={{ 
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500">
            Sign above using your mouse or touchpad
          </p>
          {isConfirmed && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              <Check className="w-3 h-3 mr-1" />
              Confirmed
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={clearSignature}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
          
          <button
            onClick={confirmSignature}
            disabled={isConfirmed}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
              isConfirmed
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Check className="w-4 h-4 mr-1" />
            {isConfirmed ? 'Confirmed' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
