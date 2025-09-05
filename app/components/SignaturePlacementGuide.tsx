'use client';

import { FileText, MousePointer, CheckCircle, Download } from 'lucide-react';

export default function SignaturePlacementGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      {/* <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        How Signature Placement Works
      </h3>
       */}
      {/* <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Create Your Signature</h4>
            <p className="text-sm text-blue-700">
              Use the signature pad to draw your signature. Click "Confirm" when done.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Add Signature Fields</h4>
            <p className="text-sm text-blue-700">
              Click "Add Signature Field" button, then click anywhere on the document where you want to place your signature.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            3
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Place Your Signature</h4>
            <p className="text-sm text-blue-700">
              Click on any signature field to apply your signature to that location on the document.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            4
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Review & Submit</h4>
            <p className="text-sm text-blue-700">
              Review all signature placements, then click "Sign & Submit Contract" to finalize.
            </p>
          </div>
        </div>
      </div> */}

      {/* <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <MousePointer className="w-4 h-4 mr-2" />
          Signature Field Features
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Blue dashed box:</strong> Empty signature field waiting for signature</li>
          <li>• <strong>Green solid box:</strong> Field with signature applied</li>
          <li>• <strong>Click to sign:</strong> Click any empty field to add your signature</li>
          <li>• <strong>Remove field:</strong> Click the X button to remove unwanted fields</li>
          <li>• <strong>Multiple fields:</strong> Add as many signature fields as needed</li>
        </ul>
      </div> */}

      {/* <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Legal Validity
        </h4>
        <p className="text-sm text-green-700">
          Each signature placement includes timestamp, document hash, and signer verification 
          to ensure legal validity and authenticity of the signed document.
        </p>
      </div> */}
    </div>
  );
}
