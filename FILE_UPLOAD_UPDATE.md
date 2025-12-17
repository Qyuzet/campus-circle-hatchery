# File Upload System Update

## Date: December 17, 2025

## Overview
Updated the file upload system to support multiple file types beyond PDF.

## Changes Made

### Supported File Types (Before)
- PDF only

### Supported File Types (After)
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Images (.jpg, .jpeg, .png)

### File Size Limit
- Maximum: 10MB (unchanged)

## Files Modified

### 1. Backend API Route
**File**: `src/app/api/upload/route.ts`

**Changes**:
- Updated allowed MIME types array to include:
  - `application/pdf`
  - `application/msword` (DOC)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
- Updated error messages to reflect new file types
- Updated console logs to be generic ("file" instead of "PDF")
- Upload now uses dynamic `contentType` based on file type

### 2. Frontend Dashboard
**File**: `src/app/dashboard/page.tsx`

**Changes**:
- Updated file input `accept` attribute to include all supported file types
- Updated `handleFileChange` validation to check against new allowed types
- Updated label from "Upload PDF File" to "Upload File (PDF, Word, or Image)"
- Updated error messages to mention all supported file types

### 3. Supabase Storage Configuration
**File**: `scripts/setup-supabase-storage.ts`

**Changes**:
- Updated bucket configuration to allow new MIME types
- Added logic to update existing bucket if it already exists
- Bucket now accepts all supported file types

**Execution**: Ran script successfully to update bucket configuration

## Technical Details

### MIME Types Supported
```javascript
const allowedTypes = [
  "application/pdf",                    // PDF
  "application/msword",                 // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "image/jpeg",                         // JPEG
  "image/jpg",                          // JPG
  "image/png",                          // PNG
];
```

### Validation Flow
1. User selects file in frontend
2. Frontend validates file type and size
3. File is uploaded to backend API
4. Backend validates file type and size again
5. File is uploaded to Supabase Storage with correct content type
6. Public URL is returned and stored in database

## Testing Checklist

- [ ] Upload PDF file
- [ ] Upload DOC file
- [ ] Upload DOCX file
- [ ] Upload JPG file
- [ ] Upload PNG file
- [ ] Verify file size limit (10MB)
- [ ] Verify error messages for invalid file types
- [ ] Verify download functionality for all file types
- [ ] Verify file preview/display in library

## Notes

- All uploaded files are stored in the same Supabase Storage bucket: `study-materials`
- Files are stored with unique names: `{timestamp}-{originalFileName}`
- Download functionality remains unchanged (works for all file types)
- File URLs are stored in the database `fileUrl` field
- Original file metadata (name, size, type) is preserved in the database

## Security Considerations

- File type validation on both frontend and backend
- File size limit enforced (10MB)
- Files stored in private Supabase bucket
- Download requires purchase verification
- Signed URLs used for secure downloads (1-hour expiry)

