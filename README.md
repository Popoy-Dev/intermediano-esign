# DocuSign - Digital Contract Signing Application

A modern, responsive web application for digital contract signing built with Next.js, React, and TypeScript. This application provides a DocuSign-like experience for signing contracts digitally.

## Features

- **File Upload**: Upload your own documents (PDF, JPEG, PNG) for signing
- **Welcome Page**: Contract details and signer information collection
- **Digital Signature Pad**: Draw signatures using mouse or touchpad
- **Contract Preview**: Real-time preview of the contract with signature
- **Document Preview**: View uploaded file details and information
- **Success Page**: Confirmation and contract summary
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd docu-sign
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Welcome Page**: 
   - Upload your document (PDF, JPEG, PNG) or use the default contract
   - Enter your full name and email address
2. **Signing Page**: 
   - Draw your signature in the signature pad
   - Review the contract preview with your uploaded document
   - Click "Sign & Submit Contract"
3. **Success Page**: View the signed contract summary and download option

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Signature**: HTML5 Canvas API
- **Build Tool**: Turbopack

## Project Structure

```
app/
├── components/
│   ├── SignaturePad.tsx           # Digital signature component
│   ├── ContractDocument.tsx       # Contract preview component
│   ├── FileUpload.tsx             # File upload component
│   ├── DocumentViewer.tsx         # Document viewer with signature placement
│   ├── PDFViewer.tsx              # PDF-specific viewer with page navigation
│   ├── RealPDFViewer.tsx          # Real PDF rendering with PDF.js
│   ├── ImageViewer.tsx            # Image document viewer
│   └── SignaturePlacementGuide.tsx # User guide for signature placement
├── globals.css                     # Global styles
├── layout.tsx                     # Root layout
└── page.tsx                       # Main application page
```

## Features in Detail

### File Upload
- Drag and drop file upload
- Support for PDF, JPEG, PNG files
- File size validation (max 10MB)
- File preview and information display
- Remove and replace functionality

### Signature Placement System
- **Real PDF Rendering**: Uses PDF.js to render actual PDF content (not static placeholders)
- **Fallback PDF Viewer**: Simple PDF viewer if PDF.js fails to load
- **Image Document Support**: Displays actual uploaded images (JPEG, PNG) for signing
- **Interactive Document Viewer**: Click to place signature fields anywhere on the document
- **Multiple Signature Fields**: Add as many signature fields as needed
- **Visual Feedback**: Blue dashed boxes for empty fields, green solid boxes for signed fields
- **PDF Support**: Special PDF viewer with page navigation for multi-page documents
- **Precise Positioning**: Exact x,y coordinates tracked for each signature placement
- **Field Management**: Add, remove, and modify signature fields easily
- **Client-Side Loading**: PDF.js loads dynamically to avoid SSR issues

### Signature Pad
- HTML5 Canvas-based signature drawing
- Mouse and touch support
- Clear and confirm functionality
- Real-time signature preview

### Contract Document
- Professional contract template
- Dynamic signer information
- Signature integration
- Legal compliance formatting
- Uploaded file preview and details

### State Management
- Multi-step form flow
- Signature data persistence
- Form validation
- Success state handling

## Customization

You can easily customize:
- Contract template in `ContractDocument.tsx`
- Signature pad styling in `SignaturePad.tsx`
- Overall theme in `globals.css`
- Application flow in `page.tsx`

## Future Enhancements

- PDF generation and download
- Email notifications
- Multiple signers support
- Document templates
- User authentication
- Contract storage and management

## License

This project is for demonstration purposes. Please ensure compliance with local laws regarding digital signatures and contracts.
