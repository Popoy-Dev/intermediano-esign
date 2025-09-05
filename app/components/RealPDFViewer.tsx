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
          
          // Use local worker file first, then fallback to CDN
          const workerSources = [
            // Local worker from public directory
            `/pdfjs/pdf.worker.min.js`,
            // CDN sources as fallback
            `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
          ];
          
          // Set the local worker source
          pdfjs.GlobalWorkerOptions.workerSrc = workerSources[0];
          
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
      
      // Try to load PDF with different configurations
      let pdf;
      let loadOptions = { data: arrayBuffer };
      
      try {
        // First try with worker
        pdf = await pdfjsLib.getDocument(loadOptions).promise;
        console.log('PDF loaded successfully with worker');
      } catch (workerError) {
        console.warn('Worker failed, trying without worker:', workerError);
        
        try {
          // Try without worker by setting workerSrc to null
          const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
          pdfjsLib.GlobalWorkerOptions.workerSrc = null;
          
          // Use minimal options for fallback loading
          loadOptions = { 
            data: arrayBuffer
          };
          pdf = await pdfjsLib.getDocument(loadOptions).promise;
          console.log('PDF loaded successfully without worker');
          
          // Restore original worker source
          pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        } catch (noWorkerError) {
          console.error('Failed to load PDF even without worker:', noWorkerError);
          throw new Error('PDF loading failed. The file might be corrupted or unsupported.');
        }
      }
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load PDF: ${errorMessage}. Please use the simple signing method below.`);
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
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      
      // Create a new PDF document
      const pdf = new jsPDF();
      
      // Get the display canvas dimensions for scaling calculations
      const displayCanvas = canvasRef.current;
      if (!displayCanvas) {
        throw new Error('Display canvas not found');
      }
      
      const displayWidth = displayCanvas.width;
      const displayHeight = displayCanvas.height;
      
      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        // Create canvas for this page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (!context) continue;
        
        // Render PDF page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Add signatures for this page only
        const pageFields = signatureFields.filter(field => field.pageNumber === pageNum);
        console.log(`Processing page ${pageNum}, found ${pageFields.length} signature fields`);
        
        for (const field of pageFields) {
          if (field.signature) {
            console.log(`Adding signature to page ${pageNum} at position (${field.x}, ${field.y})`);
            
            // Create image from signature data URL
            const signatureImg = new Image();
            signatureImg.src = field.signature;
            
            // Wait for image to load
            await new Promise((resolve) => {
              signatureImg.onload = resolve;
            });
            
            // Get the display viewport to calculate scaling
            const displayViewport = await pdfDocument.getPage(pageNum).then((page: any) => {
              const containerWidth = containerRef.current?.clientWidth || 600;
              const displayScale = Math.min(containerWidth / page.view[2], 1.5);
              return page.getViewport({ scale: displayScale });
            });
            
            // Scale coordinates from display viewport to PDF generation viewport (2.0x scale)
            const scaleX = canvas.width / displayViewport.width;
            const scaleY = canvas.height / displayViewport.height;
            
            const pdfGenX = field.x * scaleX;
            const pdfGenY = field.y * scaleY;
            const pdfGenWidth = field.width * scaleX;
            const pdfGenHeight = field.height * scaleY;
            
            console.log(`Scaled position: (${pdfGenX}, ${pdfGenY}) with size (${pdfGenWidth}, ${pdfGenHeight})`);
            
            context.drawImage(
              signatureImg,
              pdfGenX,
              pdfGenY,
              pdfGenWidth,
              pdfGenHeight
            );
          }
        }
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png');
        
        // Add page to PDF (except first page which is created automatically)
        if (pageNum > 1) {
          pdf.addPage();
        }
        
        // Add image to PDF page
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      // Download the PDF
      pdf.save(`signed-${uploadedFile.name.replace('.pdf', '')}.pdf`);
      
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
          <p className="text-sm text-red-600">
            If this continues to fail, please use the simple signing method below.
          </p>
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
