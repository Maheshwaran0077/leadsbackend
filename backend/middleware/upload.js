const multer = require('multer');
const path = require('path');

// ---------- Image Upload ----------
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  cb(null, allowed.includes(file.mimetype));
};

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { files: 5 }
});


// ---------- Video Upload ----------
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/videos/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

const videoFileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only MP4, WebM, or OGG video files are allowed'), false);
  }
  cb(null, true);
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

module.exports = videoUpload;
module.exports = {
  imageUpload,
  videoUpload
};
