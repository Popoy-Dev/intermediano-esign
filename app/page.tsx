'use client';

import { useState } from 'react';
import { FileText, PenTool, CheckCircle, Download, Upload } from 'lucide-react';
import SignaturePad from './components/SignaturePad';
import ContractDocument from './components/ContractDocument';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import PDFViewer from './components/PDFViewer';
import RealPDFViewer from './components/RealPDFViewer';

import ImageViewer from './components/ImageViewer';
import SignaturePlacementGuide from './components/SignaturePlacementGuide';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'sign' | 'success'>('welcome');
  const [signature, setSignature] = useState<string>('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleStartSigning = () => {
    setCurrentStep('sign');
  };

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleSignatureComplete = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleSubmitContract = () => {
    if (signature && signerName && signerEmail) {
      setCurrentStep('success');
    }
  };

  const handleDownloadContract = () => {
    // In a real app, this would generate and download a PDF
    alert('Contract downloaded successfully!');
  };

  if (currentStep === 'welcome') {
  return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Intermdiano E-Sign
            </h1>
            {/* <p className="text-gray-600">
              Sign your contract digitally with ease and security
            </p> */}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-red-600" />
                Upload Document
              </h2>
              <FileUpload onFileSelect={handleFileSelect} selectedFile={uploadedFile} />
            </div>

            {/* <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contract Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document:</span>
                  <span className="font-medium">
                    {uploadedFile ? uploadedFile.name : 'Default Service Agreement'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document ID:</span>
                  <span className="font-medium">#SA-2024-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div> */}

            {/* <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div> */}

            <button
              onClick={handleStartSigning}
              disabled={!uploadedFile}
              className="cursor-pointer w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Start Signing Process
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'sign') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Sign Contract - Service Agreement
                </h1>
              </div>
              <div className="text-sm text-gray-500">
                Step 2 of 2
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SignaturePlacementGuide />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PenTool className="w-5 h-5 mr-2 text-blue-600" />
                  Digital Signature
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sign in the box below using your mouse or touchpad
                </p>
              </div>
              <div className="p-6">
                <SignaturePad onSignatureComplete={handleSignatureComplete} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Document Signing
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Place your signature on the document
                </p>
              </div>
              <div className="p-6">
                {uploadedFile && uploadedFile.type === 'application/pdf' ? (
                  <RealPDFViewer 
                    uploadedFile={uploadedFile}
                    signature={signature}
                    onSignaturePlace={(signatureData, position) => {
                      console.log('Signature placed at:', position);
                    }}
                  />
                ) : uploadedFile && uploadedFile.type.startsWith('image/') ? (
                  <ImageViewer 
                    uploadedFile={uploadedFile}
                    signature={signature}
                    onSignaturePlace={(signatureData, position) => {
                      console.log('Signature placed at:', position);
                    }}
                  />
                ) : (
                  <DocumentViewer 
                    uploadedFile={uploadedFile}
                    signature={signature}
                    onSignaturePlace={(signatureData, position) => {
                      console.log('Signature placed at:', position);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setCurrentStep('welcome')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitContract}
              disabled={!signature}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Sign & Submit Contract
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Contract Signed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your contract has been signed and submitted. You will receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contract Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Signer:</span>
                <span className="font-medium">{signerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{signerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Signed Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Document:</span>
                <span className="font-medium">{uploadedFile ? uploadedFile.name : 'Default Service Agreement'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract ID:</span>
                <span className="font-medium">#SA-2024-001</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadContract}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Contract
            </button>
            <button
              onClick={() => {
                setCurrentStep('welcome');
                setSignature('');
                setSignerName('');
                setSignerEmail('');
                setUploadedFile(null);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Another Contract
            </button>
          </div>
        </div>
    </div>
  );
  }

  return null;
}
