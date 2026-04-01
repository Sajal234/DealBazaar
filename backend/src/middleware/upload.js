import multer from 'multer';

// Implement Memory Storage:
// We explicitly do NOT store files on the server filesystem.
// The file buffer is held in memory and directly streamed to Cloudinary in the controller.
const storage = multer.memoryStorage();

// Strict File Type Validation (MIME checking)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Complete rejection of PDFs, scripts, or malicious non-image formats
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

// Establish Upload Middleware Constraints
const upload = multer({
  storage,
  limits: {
    // Strict 2MB ceiling per image as demanded by the architecture plan
    fileSize: 2 * 1024 * 1024, 
  },
  fileFilter,
});

export default upload;
