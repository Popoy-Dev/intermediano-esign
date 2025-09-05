'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X, Eye } from 'lucide-react';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signature?: string;
  pageNumber: number;
}

interface PDFViewerProps {
  uploadedFile: File | null;
  signature: string;
  onSignaturePlace: (signatureData: string, position: { x: number; y: number; page: number }) => void;
}

export default function PDFViewer({ uploadedFile, signature, onSignaturePlace }: PDFViewerProps) {
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      const url = URL.createObjectURL(uploadedFile);
      setPdfUrl(url);
      
      // In a real implementation, you would use a PDF library like pdf.js
      // For now, we'll simulate with a placeholder
      setTotalPages(1);
    }
  }, [uploadedFile]);

  useEffect(() => {
    if (pdfUrl) {
      renderPDF();
    }
  }, [pdfUrl, currentPage]);

  const renderPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw PDF placeholder (in real app, this would render actual PDF)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw page content
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    ctx.fillText(`PDF Document - Page ${currentPage}`, 50, 50);
    
    ctx.font = '12px Arial';
    ctx.fillText('This is a preview of your PDF document.', 50, 80);
    ctx.fillText('Click "Add Signature Field" to place signature fields.', 50, 100);
    ctx.fillText('Then click on the field to add your signature.', 50, 120);

    // Draw some sample content
    ctx.fillText('Contract Terms:', 50, 150);
    ctx.fillText('1. Service Agreement', 70, 170);
    ctx.fillText('2. Payment Terms', 70, 190);
    ctx.fillText('3. Duration', 70, 210);
    ctx.fillText('4. Termination', 70, 230);

    // Draw signature fields for current page
    const pageFields = signatureFields.filter(field => field.pageNumber === currentPage);
    pageFields.forEach(field => {
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
      x: x - 75,
      y: y - 25,
      width: 150,
      height: 50,
      pageNumber: currentPage
    };

    setSignatureFields([...signatureFields, newField]);
    setIsAddingField(false);
    renderPDF();
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
      
      const field = signatureFields.find(f => f.id === fieldId);
      if (field) {
        onSignaturePlace(signature, { x: field.x, y: field.y, page: field.pageNumber });
      }
      
      renderPDF();
    }
  };

  const removeField = (fieldId: string) => {
    setSignatureFields(fields => fields.filter(field => field.id !== fieldId));
    renderPDF();
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!uploadedFile) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-gray-500">No document uploaded</p>
      </div>
    );
  }

  const currentPageFields = signatureFields.filter(field => field.pageNumber === currentPage);

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
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
              isAddingField
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isAddingField ? 'Click to place field' : 'Add Signature Field'}
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

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

      {currentPageFields.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Signature Fields (Page {currentPage}):</h4>
          {currentPageFields.map(field => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${field.signature ? 'bg-green-500' : 'bg-blue-500'}`} />
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Click anywhere on the document to place a signature field
          </p>
        </div>
      )}

      {/* PDF Preview Link */}
      {pdfUrl && (
        <div className="text-center">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Open PDF in New Tab
          </a>
        </div>
      )}
    </div>
  );
}
