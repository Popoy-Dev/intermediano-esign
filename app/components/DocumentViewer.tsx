'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Move, Check, X } from 'lucide-react';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signature?: string;
}

interface DocumentViewerProps {
  uploadedFile: File | null;
  signature: string;
  onSignaturePlace: (signatureData: string, position: { x: number; y: number }) => void;
}

export default function DocumentViewer({ uploadedFile, signature, onSignaturePlace }: DocumentViewerProps) {
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uploadedFile && canvasRef.current) {
      drawDocument();
    }
  }, [uploadedFile]);

  const drawDocument = () => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedFile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // Create a placeholder document (in a real app, you'd render the actual PDF/image)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw document border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw document content
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    ctx.fillText('DOCUMENT PREVIEW', 50, 50);
    
    ctx.font = '12px Arial';
    ctx.fillText('This is a preview of your uploaded document.', 50, 80);
    ctx.fillText('Click "Add Signature Field" to place your signature.', 50, 100);
    ctx.fillText('Then click on the field to add your signature.', 50, 120);

    // Draw signature fields
    signatureFields.forEach(field => {
      ctx.strokeStyle = field.signature ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash(field.signature ? [] : [5, 5]);
      ctx.strokeRect(field.x, field.y, field.width, field.height);

      if (field.signature) {
        // Draw signature image
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, field.x + 5, field.y + 5, field.width - 10, field.height - 10);
        };
        img.src = field.signature;
      } else {
        // Draw placeholder text
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Arial';
        ctx.fillText('Click to sign', field.x + 5, field.y + 15);
      }
    });
  };

  const addSignatureField = () => {
    setIsAddingField(true);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingField) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newField: SignatureField = {
      id: Date.now().toString(),
      x: x - 75, // Center the field
      y: y - 25,
      width: 150,
      height: 50
    };

    setSignatureFields([...signatureFields, newField]);
    setIsAddingField(false);
    drawDocument();
  };

  const handleFieldClick = (fieldId: string) => {
    if (signature) {
      setSignatureFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, signature }
            : field
        )
      );
      drawDocument();
    }
  };

  const removeField = (fieldId: string) => {
    setSignatureFields(fields => fields.filter(field => field.id !== fieldId));
    drawDocument();
  };

  if (!uploadedFile) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500">No document uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Document: {uploadedFile.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={addSignatureField}
            disabled={isAddingField}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              isAddingField
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isAddingField ? 'Click on document to place field' : 'Add Signature Field'}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="border border-gray-200 rounded-lg overflow-hidden bg-white"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
          style={{ maxHeight: '600px' }}
        />
      </div>

      {signatureFields.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Signature Fields:</h4>
          {signatureFields.map(field => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${field.signature ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-700">
                  Field at ({Math.round(field.x)}, {Math.round(field.y)})
                  {field.signature ? ' - Signed' : ' - Pending'}
                </span>
              </div>
              <div className="flex space-x-2">
                {!field.signature && signature && (
                  <button
                    onClick={() => handleFieldClick(field.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Add signature"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => removeField(field.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove field"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddingField && (
        <div className="p-3 bg-blue-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Click anywhere on the document to place a signature field
          </p>
        </div>
      )}
    </div>
  );
}
