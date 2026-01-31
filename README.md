# Contract Document Manager (የውል ወረቀት ፎርም)

A web-based contract document generator for creating joint business partnership agreements. Built with Amharic language support and includes features for digital signatures, stamp images, ID photos, and more.

## Features

### 📋 Document Templates
- Joint Business Partnership Agreement form
- Articles 1-10 with complete contract terms
- Witness agreement section
- Company and partner signature areas

### ✍️ Digital Signatures
- Canvas-based signature input
- For company, partner, and witnesses
- Clear and undo buttons for signatures

### 🪙 Stamp Integration
- Upload stamp images
- Click anywhere on the document to place stamp
- Drag to reposition stamp
- Add multiple stamps in different positions
- Transparent stamp effect for authentic look

### 🪪 ID Photo Upload
- Front ID photo upload
- Back ID photo upload
- Mobile camera capture support (capture="environment")
- Remove buttons to delete uploaded images

### 🖨️ Print and Export
- Print preview functionality
- Export to Word (.doc) format
- All form data visible in print/export

## Usage

### Filling Out the Document
1. Fill in the form fields with contract details
2. Use the signature canvas to add signatures
3. Upload a stamp image and click on the document to place it
4. Upload ID photos using the upload section above the document

### Printing
1. Click the "Print" button to open print preview
2. Review the document in print view
3. Print the document

### Exporting
Click "Download as Word (.doc)" to download in .doc format

## File Structure

```
doc_manager/
├── index.html          # Main HTML file
├── stamp.jpg           # Sample stamp image
├── css/
│   └── style.css       # Styles and paper effects
└── js/
    └── script.js       # JavaScript functionality
```

## Browser Requirements

- Modern web browsers (Chrome, Firefox, Edge, Safari)
- Mobile device support
- Printer support

## Language

This project is built with Amharic language support. The interface and document content are in Amharic.

## License

MIT License
