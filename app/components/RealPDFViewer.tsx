'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signature?: string;
  pageNumber: number;
}

interface RealPDFViewerProps {
  uploadedFile: File | null;
  signature: string;
  onSignaturePlace: (signatureData: string, position: { x: number; y: number; page: number }) => void;
}

export default function RealPDFViewer({ uploadedFile, signature, onSignaturePlace }: RealPDFViewerProps) {
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PDF.js dynamically on client side
    const loadPdfJs = async () => {
      if (typeof window !== 'undefined') {
        try {
          const pdfjs = await import('pdfjs-dist');
          

          const workerVersion = pdfjs.version || '4.4.168';
          
          const workerSources = [
            `https://unpkg.com/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`,
            `https://unpkg.com/pdfjs-dist@${workerVersion}/build/pdf.worker.min.js`,
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`,
            `/pdfjs/pdf.worker.min.js`
          ];
          
          pdfjs.GlobalWorkerOptions.workerSrc = workerSources[0];
          console.log(`PDF.js worker set to: ${workerSources[0]}`);
          
          setPdfjsLib(pdfjs);
        } catch (err) {
          console.error('Failed to load PDF.js:', err);
          setError('Failed to load PDF viewer. Please use the simple signing method below.');
        }
      }
    };
    
    loadPdfJs();
  }, []);

  useEffect(() => {
    if (uploadedFile && uploadedFile.type === 'application/pdf' && pdfjsLib) {
      loadPDF();
    }
  }, [uploadedFile, pdfjsLib]);

  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage();
    }
  }, [pdfDocument, currentPage, signatureFields]);

  const loadPDF = async () => {
    if (!uploadedFile || !pdfjsLib) return;

    setIsLoading(true);
    setError('');

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      console.log(`Loading PDF: ${uploadedFile.name}, Size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`);
      
      let pdf;
      const loadOptions: any = { 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false,
        verbosity: 0
      };
      
      try {
        pdf = await pdfjsLib.getDocument(loadOptions).promise;
        console.log('PDF loaded successfully');
      } catch (loadError: any) {
        console.error('PDF loading error details:', {
          name: loadError?.name,
          message: loadError?.message,
          stack: loadError?.stack
        });
        
        try {
          console.log('Attempting fallback with minimal options...');
          pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            verbosity: 0
          }).promise;
          console.log('PDF loaded with fallback options');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          const errorMsg = loadError?.message || 'Unknown error';
          
          if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
            throw new Error('This PDF is password protected. Please unlock it first.');
          } else if (errorMsg.includes('corrupted')) {
            throw new Error('The PDF file appears to be corrupted.');
          } else if (errorMsg.includes('Invalid PDF')) {
            throw new Error('Invalid PDF format. The file might not be a valid PDF.');
          } else {
            throw new Error(`PDF loading failed: ${errorMsg}`);
          }
        }
      }
      
      if (!pdf) {
        throw new Error('Failed to load PDF document.');
      }
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      console.log(`PDF loaded: ${pdf.numPages} page(s)`);
    } catch (err) {
      console.error('Error loading PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load PDF: ${errorMessage}. Please try a different file or use the simple signing method below.`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Calculate scale to fit canvas
      const containerWidth = containerRef.current?.clientWidth || 600;
      const scale = Math.min(containerWidth / page.view[2], 1.5);
      
      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Draw signature fields for current page
      drawSignatureFields(context, viewport);
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page.');
    }
  };

  const drawSignatureFields = (context: CanvasRenderingContext2D, viewport: any) => {
    const pageFields = signatureFields.filter(field => field.pageNumber === currentPage);
    
    pageFields.forEach(field => {
      // Draw signature field border
      context.strokeStyle = field.signature ? '#10b981' : '#3b82f6';
      context.lineWidth = 2;
      context.setLineDash(field.signature ? [] : [5, 5]);
      context.strokeRect(field.x, field.y, field.width, field.height);

      if (field.signature) {
        // Draw signature image
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, field.x + 5, field.y + 5, field.width - 10, field.height - 10);
        };
        img.src = field.signature;
      } else {
        // Draw placeholder text
        context.fillStyle = '#6b7280';
        context.font = '12px Arial';
        context.fillText('Click to sign', field.x + 5, field.y + 20);
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
    
    // Get the actual canvas dimensions (not CSS dimensions)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the scale factor between CSS and actual canvas
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    // Get click position relative to CSS dimensions
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    // Convert to actual canvas coordinates
    const x = cssX * scaleX;
    const y = cssY * scaleY;

    const newField: SignatureField = {
      id: Date.now().toString(),
      x: x - 75, // Center the field
      y: y - 25,
      width: 150,
      height: 50,
      pageNumber: currentPage
    };

    console.log(`Creating signature field on page ${currentPage} at position (${newField.x}, ${newField.y})`);
    setSignatureFields([...signatureFields, newField]);
    setIsAddingField(false);
  };

  const handleFieldClick = (fieldId: string) => {
    if (signature) {
      const field = signatureFields.find(f => f.id === fieldId);
      if (field) {
        console.log(`Applying signature to field ${fieldId} on page ${field.pageNumber}`);
        setSignatureFields(fields => 
          fields.map(f => 
            f.id === fieldId 
              ? { ...f, signature }
              : f
          )
        );
        
        onSignaturePlace(signature, { x: field.x, y: field.y, page: field.pageNumber });
      }
    }
  };

  const removeField = (fieldId: string) => {
    setSignatureFields(fields => fields.filter(field => field.id !== fieldId));
  };

  const downloadSignedPDF = async () => {
    if (!pdfDocument || !uploadedFile) return;

    try {
      // Use PDF-lib for proper PDF manipulation that preserves text quality
      const { PDFDocument } = await import('pdf-lib');
      
      // Load the original PDF - this preserves all text and formatting!
      const existingPdfBytes = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get all pages
      const pages = pdfDoc.getPages();
      
      // Process each page
      for (let pageNum = 0; pageNum < pages.length; pageNum++) {
        const page = pages[pageNum];
        const pageFields = signatureFields.filter(field => field.pageNumber === pageNum + 1);
        
        console.log(`Processing page ${pageNum + 1}, found ${pageFields.length} signature fields`);
        
        // Add signatures to this page
        for (const field of pageFields) {
          if (field.signature) {
            console.log(`Adding signature to page ${pageNum + 1} at position (${field.x}, ${field.y})`);
            
            try {
              // Convert signature to PNG bytes for better quality
              const signatureDataUrl = field.signature;
              const base64Data = signatureDataUrl.split(',')[1];
              const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              
              // Embed the signature image
              const signatureImage = await pdfDoc.embedPng(signatureBytes);
              
              // Get page dimensions for scaling
              const { width: pageWidth, height: pageHeight } = page.getSize();
              const displayCanvas = canvasRef.current;
              
              if (displayCanvas) {
                // Calculate scaling from display to PDF coordinates
                const displayWidth = displayCanvas.width;
                const displayHeight = displayCanvas.height;
                
                const scaleX = pageWidth / displayWidth;
                const scaleY = pageHeight / displayHeight;
                
                // Scale signature position and size
                const pdfX = field.x * scaleX;
                const pdfY = pageHeight - (field.y * scaleY) - (field.height * scaleY); // Flip Y coordinate
                const pdfWidth = field.width * scaleX;
                const pdfHeight = field.height * scaleY;
                
                console.log(`PDF coordinates: (${pdfX}, ${pdfY}) with size (${pdfWidth}, ${pdfHeight})`);
                
                // Draw signature on PDF page - this preserves the original text!
                page.drawImage(signatureImage, {
                  x: pdfX,
                  y: pdfY,
                  width: pdfWidth,
                  height: pdfHeight,
                });
              }
            } catch (signatureError) {
              console.error('Error adding signature:', signatureError);
              // Continue with other signatures even if one fails
            }
          }
        }
      }
      
      // Save the modified PDF - this preserves original text quality!
      const pdfBytes = await pdfDoc.save();
      // Convert to ArrayBuffer to ensure type compatibility
      const arrayBuffer = pdfBytes.buffer instanceof ArrayBuffer 
        ? pdfBytes.buffer 
        : new ArrayBuffer(pdfBytes.length);
      if (!(pdfBytes.buffer instanceof ArrayBuffer)) {
        new Uint8Array(arrayBuffer).set(pdfBytes);
      }
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed-${uploadedFile.name.replace('.pdf', '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error creating signed PDF:', error);
      alert('Failed to create signed PDF. Please try again.');
    }
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

  if (!pdfjsLib) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF viewer...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-8 text-center bg-red-50">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-y-3">
          <button
            onClick={loadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {/* <p className="text-sm text-red-600">
            If this continues to fail, please use the simple signing method below.
          </p> */}
        </div>
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
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              isAddingField
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isAddingField ? 'Click to place field' : 'Add Signature Field'}
          </button>
          
          {signatureFields.some(field => field.signature) && (
            <button
              onClick={downloadSignedPDF}
              className="cursor-pointer flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Download Signed PDF
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      <div 
        ref={containerRef}
        className="border border-gray-200 rounded-lg overflow-auto bg-white max-h-96"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
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
            Click anywhere on the PDF to place a signature field
          </p>
        </div>
      )}

      {/* PDF Info */}
      <div className="text-center text-sm text-gray-500">
        <p>PDF loaded successfully • {totalPages} page{totalPages !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
