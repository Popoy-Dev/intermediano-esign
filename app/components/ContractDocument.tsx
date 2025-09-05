'use client';

import { Calendar, User, Mail, FileText } from 'lucide-react';

interface ContractDocumentProps {
  signerName: string;
  signerEmail: string;
  signature: string;
  uploadedFile: File | null;
}

export default function ContractDocument({ signerName, signerEmail, signature, uploadedFile }: ContractDocumentProps) {
  return (
    <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {uploadedFile ? uploadedFile.name.toUpperCase().replace(/\.[^/.]+$/, "") : 'SERVICE AGREEMENT'}
          </h1>
          <p className="text-gray-600">Contract ID: #SA-2024-001</p>
        </div>

        {/* Uploaded File Preview */}
        {uploadedFile && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Document Preview
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File Name:</span>
                <span className="font-medium">{uploadedFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File Size:</span>
                <span className="font-medium">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File Type:</span>
                <span className="font-medium">{uploadedFile.type}</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white border rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                📄 Document ready for signing
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Your signature will be applied to this document
              </p>
            </div>
          </div>
        )}

        {/* Contract Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Effective Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Client Name</p>
              <p className="font-medium">{signerName || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Client Email</p>
              <p className="font-medium">{signerEmail || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-red-600" />
            {uploadedFile ? 'Document Information' : 'Terms and Conditions'}
          </h2>
          
          {uploadedFile ? (
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Document Type:</strong> {uploadedFile.type.includes('pdf') ? 'PDF Document' : 'Image Document'}
              </p>
              
              <p>
                <strong>Upload Date:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <p>
                <strong>Digital Signature:</strong> This document will be digitally signed and legally binding.
              </p>
              
              <p>
                <strong>Authentication:</strong> Signature includes timestamp and signer verification.
              </p>
              
              <p>
                <strong>Legal Validity:</strong> This digital signature has the same legal effect as a handwritten signature.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1. Service Description:</strong> The service provider agrees to deliver professional services as outlined in this agreement.
              </p>
              
              <p>
                <strong>2. Payment Terms:</strong> Payment shall be made within 30 days of invoice receipt. Late payments may incur additional fees.
              </p>
              
              <p>
                <strong>3. Duration:</strong> This agreement shall remain in effect for a period of 12 months from the effective date.
              </p>
              
              <p>
                <strong>4. Confidentiality:</strong> Both parties agree to maintain confidentiality of all proprietary information shared during the course of this agreement.
              </p>
              
              <p>
                <strong>5. Termination:</strong> Either party may terminate this agreement with 30 days written notice.
              </p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Digital Signature
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Client Signature:</p>
              {signature ? (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img 
                    src={signature} 
                    alt="Digital Signature" 
                    className="max-h-20 mx-auto"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Digitally signed by {signerName}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-500">No signature provided</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Signed By:</p>
                <p className="font-medium">{signerName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-gray-500 text-center">
          <p>
            This document has been electronically signed and is legally binding.
            <br />
            Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
