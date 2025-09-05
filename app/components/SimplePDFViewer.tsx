'use client';

import { useState } from 'react';
import { Plus, Check, X, Eye, FileText, Download } from 'lucide-react';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signature?: string;
  pageNumber: number;
}

interface SimplePDFViewerProps {
  uploadedFile: File | null;
  signature: string;
  onSignaturePlace: (signatureData: string, position: { x: number; y: number; page: number }) => void;
}

export default function SimplePDFViewer({ uploadedFile, signature, onSignaturePlace }: SimplePDFViewerProps) {
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Create object URL for PDF preview
  if (uploadedFile && !pdfUrl) {
    const url = URL.createObjectURL(uploadedFile);
    setPdfUrl(url);
  }

  const addSignatureField = () => {
    setIsAddingField(true);
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
    }
  };

  const removeField = (fieldId: string) => {
    setSignatureFields(fields => fields.filter(field => field.id !== fieldId));
  };

  const downloadSignedDocument = async () => {
    if (!uploadedFile) return;

    // Create a simple document with signature information
    const signedFields = signatureFields.filter(field => field.signature);
    
    if (signedFields.length === 0) {
      alert('Please add at least one signature before downloading.');
      return;
    }

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      
      // Create a new PDF document
      const pdf = new jsPDF();
      
      // Add header information
      pdf.setFontSize(20);
      pdf.text('Signed Document', 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Original File: ${uploadedFile.name}`, 20, 50);
      pdf.text(`File Size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`, 20, 60);
      pdf.text(`Signed On: ${new Date().toLocaleString()}`, 20, 70);
      
      // Add document information
      pdf.setFontSize(14);
      pdf.text('Document Information', 20, 90);
      pdf.setFontSize(10);
      pdf.text('This document has been digitally signed using the DocuSign application.', 20, 100);
      pdf.text(`Number of signature fields: ${signedFields.length}`, 20, 110);
      
      // Add signatures
      let yPosition = 130;
      pdf.setFontSize(14);
      pdf.text('Signatures Applied:', 20, yPosition);
      yPosition += 15;
      
      signedFields.forEach((field, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFontSize(12);
        pdf.text(`Signature Field ${index + 1}`, 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.text(`Field ID: ${field.id}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Position: X: ${field.x}, Y: ${field.y}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Size: ${field.width} x ${field.height} pixels`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Page: ${field.pageNumber}`, 20, yPosition);
        yPosition += 15;
        
        // Add signature image if it fits on the page
        if (yPosition < 200) {
          try {
            // Convert data URL to base64
            const base64Data = field.signature.split(',')[1];
            pdf.addImage(base64Data, 'PNG', 20, yPosition, 100, 40);
            yPosition += 50;
          } catch (error) {
            pdf.text('Signature image could not be embedded', 20, yPosition);
            yPosition += 10;
          }
        }
        
        yPosition += 10;
      });
      
      // Add footer
      pdf.setFontSize(8);
      pdf.text(`This is a digital signature record. The original document "${uploadedFile.name}" has been signed with the above signatures.`, 20, pdf.internal.pageSize.getHeight() - 20);
      
      // Download the PDF
      pdf.save(`signed-${uploadedFile.name.replace(/\.[^/.]+$/, '')}.pdf`);
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to create PDF. Please try again.');
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
          
          {signatureFields.some(field => field.signature) && (
            <button
              onClick={downloadSignedDocument}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Download Signed Document
            </button>
          )}
        </div>
      </div>

      {/* PDF Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>PDF Document Preview</span>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <div className="mb-4">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              PDF Document Ready for Signing
            </h4>
            <p className="text-gray-600 mb-4">
              Your PDF document has been uploaded successfully. You can add signature fields and sign the document.
            </p>
          </div>

          {/* Signature Fields List */}
          {currentPageFields.length > 0 && (
            <div className="space-y-2 mb-4">
              <h5 className="font-medium text-gray-900">Signature Fields:</h5>
              {currentPageFields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${field.signature ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <span className="text-sm text-gray-700">
                      Field {field.id.slice(-4)}
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

          {/* Add Field Button */}
          {isAddingField && (
            <div className="mb-4">
              <button
                onClick={() => {
                  const newField: SignatureField = {
                    id: Date.now().toString(),
                    x: 0,
                    y: 0,
                    width: 150,
                    height: 50,
                    pageNumber: currentPage
                  };
                  setSignatureFields([...signatureFields, newField]);
                  setIsAddingField(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Signature Field
              </button>
            </div>
          )}

          {isAddingField && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Click "Add Signature Field" above to create a signature field for this document
              </p>
            </div>
          )}
        </div>
      </div>

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

      {/* Document Info */}
      <div className="text-center text-sm text-gray-500">
        <p>PDF document ready for signing • File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    </div>
  );
}
